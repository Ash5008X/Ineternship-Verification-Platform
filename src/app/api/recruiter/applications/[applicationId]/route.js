
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

import Application from "@/models/Application";
import Internship from "@/models/Internship";

const ALLOWED_STATUSES = [
    "applied",
    "interviewing",
    "offered",
    "rejected",
];

function serializeApplication(application) {
    const student = application.userId;
    const internship = application.internshipId;
    const cv = application.cvId;

    return {
        _id: application._id,
        status: application.status,
        applicationMethod: application.applicationMethod,
        appliedAt: application.appliedAt,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,

        student: student
            ? {
                _id: student._id,
                name: student.name,
                email: student.email,
                avatarUrl: student.avatarUrl,
                profile: student.profile || {},
            }
            : null,

        internship: internship
            ? {
                _id: internship._id,
                title: internship.title,
                category: internship.category,
                status: internship.status,
            }
            : null,

        cv: cv
            ? {
                _id: cv._id,
                version: cv.version,
                originalName: cv.file?.originalName || null,
                mimeType: cv.file?.mimeType || null,
                sizeBytes: cv.file?.sizeBytes || null,
            }
            : null,

        cvSnapshot: application.cvSnapshot
            ? {
                version: application.cvSnapshot.version,
            }
            : null,
    };
}

async function getOwnedApplication(
    applicationId,
    companyId,
    userId
) {
    const companyInternships = await Internship.find({
        companyId,
        createdBy: userId,
    }).distinct("_id");

    return Application.findOne({
        _id: applicationId,
        internshipId: {
            $in: companyInternships,
        },
    })
        .populate({
            path: "userId",
            select: "name email avatarUrl profile",
        })
        .populate({
            path: "internshipId",
            select: "title category status",
        })
        .populate({
            path: "cvId",
            select: "version file.originalName file.mimeType file.sizeBytes",
        });
}

export async function GET(request, { params }) {
    try {
        const { applicationId } = await params;

        if (!mongoose.isValidObjectId(applicationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid application ID.",
                },
                { status: 400 }
            );
        }

        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: error.status }
            );
        }

        await connectDB();

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                },
                { status: 404 }
            );
        }

        const application = await getOwnedApplication(
            applicationId,
            company._id,
            user._id
        );

        if (!application) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: serializeApplication(application),
        });
    } catch (error) {
        console.error(
            "GET recruiter application error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch application.",
            },
            { status: 500 }
        );
    }
}

export async function PATCH(request, { params }) {
    try {
        const { applicationId } = await params;

        if (!mongoose.isValidObjectId(applicationId)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid application ID.",
                },
                { status: 400 }
            );
        }

        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: error.status }
            );
        }

        await connectDB();

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                },
                { status: 404 }
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid JSON request body.",
                },
                { status: 400 }
            );
        }

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body) ||
            Object.keys(body).length !== 1 ||
            !Object.hasOwn(body, "status")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Provide only a valid status field.",
                },
                { status: 400 }
            );
        }

        if (!ALLOWED_STATUSES.includes(body.status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Status must be one of: ${ALLOWED_STATUSES.join(", ")}.`,
                },
                { status: 400 }
            );
        }

        const application = await getOwnedApplication(
            applicationId,
            company._id,
            user._id
        );

        if (!application) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                },
                { status: 404 }
            );
        }

        if (application.status === "withdrawn") {
            return NextResponse.json(
                {
                    success: false,
                    message: "A withdrawn application cannot be changed.",
                },
                { status: 409 }
            );
        }

        application.status = body.status;

        await application.save();

        const updatedApplication = await getOwnedApplication(
            applicationId,
            company._id,
            user._id
        );

        return NextResponse.json({
            success: true,
            message: "Application status updated.",
            data: serializeApplication(updatedApplication),
        });
    } catch (error) {
        console.error(
            "PATCH recruiter application error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to update application status.",
            },
            { status: 500 }
        );
    }
}

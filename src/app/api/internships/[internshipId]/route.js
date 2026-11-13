
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import { getCurrentUser } from "@/lib/auth/getCurrentUser";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

export async function GET(request, { params }) {
    try {
        const { internshipId } = await params;

        if (!mongoose.isValidObjectId(internshipId)) {
            return NextResponse.json(
                { success: false, message: "Invalid internship ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const internship = await Internship.findById(internshipId)
            .populate("companyId", "name website identityStatus")
            .lean();

        if (!internship) {
            return NextResponse.json(
                { success: false, message: "Internship not found." },
                { status: 404 }
            );
        }

        const isPubliclyVisible =
            internship.status === "active" &&
            (
                !internship.applicationDeadline ||
                new Date(internship.applicationDeadline) >= new Date()
            );

        if (!isPubliclyVisible) {
            const user = await getCurrentUser();

            if (!user || user.status !== "active") {
                return NextResponse.json(
                    { success: false, message: "Internship not found." },
                    { status: 404 }
                );
            }

            if (user.role !== "recruiter") {
                return NextResponse.json(
                    { success: false, message: "Internship not found." },
                    { status: 404 }
                );
            }

            const company = await getRecruiterCompany(user._id);

            if (
                !company ||
                !internship.companyId ||
                company._id.toString() !== internship.companyId._id.toString()
            ) {
                return NextResponse.json(
                    { success: false, message: "Internship not found." },
                    { status: 404 }
                );
            }
        }

        return NextResponse.json(
            { success: true, data: internship },
            { status: 200 }
        );

    } catch (error) {
        console.error("Fetch Internship Error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to retrieve internship." },
            { status: 500 }
        );
    }
}


const ALLOWED_UPDATE_FIELDS = [
    "title",
    "description",
    "category",
    "requiredSkills",
    "preferredSkills",
    "stipend",
    "duration",
    "workMode",
    "location",
    "eligibility",
    "applicationMethod",
    "applicationUrl",
    "applicationDeadline",
];



function validateApplicationUrl(value) {
    if (value === null || value === "") {
        return true;
    }

    if (typeof value !== "string" || value.length > 2000) {
        return false;
    }

    try {
        const url = new URL(value);

        return (
            ["http:", "https:"].includes(url.protocol) &&
            Boolean(url.hostname) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
}


function validateNestedFields(body) {
    const objectFields = [
        "stipend",
        "duration",
        "location",
        "eligibility",
    ];

    for (const field of objectFields) {
        if (
            Object.hasOwn(body, field) &&
            body[field] !== null &&
            (
                typeof body[field] !== "object" ||
                Array.isArray(body[field])
            )
        ) {
            return false;
        }
    }

    const arrayFields = [
        "requiredSkills",
        "preferredSkills",
    ];

    for (const field of arrayFields) {
        if (
            Object.hasOwn(body, field) &&
            !Array.isArray(body[field])
        ) {
            return false;
        }
    }

    return true;
}


export async function PATCH(request, { params }) {
    try {
        const { internshipId } = await params;

        if (!mongoose.isValidObjectId(internshipId)) {
            return NextResponse.json(
                { success: false, message: "Invalid internship ID." },
                { status: 400 }
            );
        }

        await connectDB();

        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { success: false, message: "Authentication required." },
                { status: 401 }
            );
        }

        if (user.status !== "active" || user.role !== "recruiter") {
            return NextResponse.json(
                { success: false, message: "Recruiter access required." },
                { status: 403 }
            );
        }

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                { success: false, message: "No associated company found." },
                { status: 404 }
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON request body." },
                { status: 400 }
            );
        }

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body) ||
            Object.keys(body).length === 0
        ) {
            return NextResponse.json(
                { success: false, message: "Update data is required." },
                { status: 400 }
            );
        }

        const unknownFields = Object.keys(body).filter(
            (key) => !ALLOWED_UPDATE_FIELDS.includes(key)
        );


        if (unknownFields.length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Unsupported or protected fields supplied.",
                },
                { status: 400 }
            );
        }

        if (!validateNestedFields(body)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid nested internship information.",
                },
                { status: 400 }
            );
        }


        const internship = await Internship.findOne({
            _id: internshipId,
            companyId: company._id,
            createdBy: user._id,
        });

        if (!internship) {
            return NextResponse.json(
                { success: false, message: "Internship not found." },
                { status: 404 }
            );
        }

        if (["withdrawn", "pending", "rejected"].includes(internship.status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This internship cannot be edited in its current status.",
                },
                { status: 409 }
            );
        }

        const effectiveMethod = Object.hasOwn(body, "applicationMethod")
            ? body.applicationMethod
            : internship.applicationMethod;

        const effectiveUrl = Object.hasOwn(body, "applicationUrl")
            ? body.applicationUrl
            : internship.applicationUrl;

        if (!["external", "internal"].includes(effectiveMethod)) {
            return NextResponse.json(
                { success: false, message: "Invalid application method." },
                { status: 400 }
            );
        }

        if (
            effectiveMethod === "external" &&
            !validateApplicationUrl(effectiveUrl)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid application URL is required for external applications.",
                },
                { status: 400 }
            );
        }

        if (
            effectiveMethod === "internal" &&
            effectiveUrl !== null &&
            effectiveUrl !== undefined &&
            effectiveUrl !== ""
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application URL should not be provided for internal applications.",
                },
                { status: 400 }
            );
        }

        // Only update explicitly allowed fields.
        for (const field of ALLOWED_UPDATE_FIELDS) {
            if (Object.hasOwn(body, field)) {
                internship.set(field, body[field]);
            }
        }

        // An edited active listing must be assessed again.
        if (internship.status === "active") {
            internship.status = "draft";
        }

        await internship.save();

        return NextResponse.json(
            {
                success: true,
                message: "Internship updated successfully.",
                data: internship,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Update Internship Error:", error);

        if (
            error instanceof mongoose.Error.ValidationError ||
            error instanceof mongoose.Error.CastError
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid internship information." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Unable to update internship." },
            { status: 500 }
        );
    }
}

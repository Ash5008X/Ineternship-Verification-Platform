import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";
import cloudinary from "@/lib/cloudinary/client";

import Application from "@/models/Application";
import Internship from "@/models/Internship";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

        const ownedInternships = await Internship.find({
            companyId: company._id,
            createdBy: user._id,
        }).distinct("_id");

        const application = await Application.findOne({
            _id: applicationId,
            internshipId: { $in: ownedInternships },
        })
            .populate({
                path: "cvId",
                select:
                    "file.originalName file.mimeType file.storageProvider file.fileKey",
            })
            .lean();

        if (!application) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application not found.",
                },
                { status: 404 }
            );
        }

        const snapshotPublicId = application.cvSnapshot?.fileKey;
        const cv = application.cvId;

        if (
            !snapshotPublicId ||
            !cv ||
            cv.file?.storageProvider !== "cloudinary" ||
            cv.file?.fileKey !== snapshotPublicId
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No downloadable CV is attached to this application.",
                },
                { status: 404 }
            );
        }

        const extension = snapshotPublicId
            .split(".")
            .pop()
            ?.toLowerCase();

        if (!extension || !["pdf", "doc", "docx"].includes(extension)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "CV file format is not supported.",
                },
                { status: 415 }
            );
        }

        const signedUrl = cloudinary.utils.private_download_url(
            snapshotPublicId,
            extension,
            {
                resource_type: "raw",
                type: "authenticated",
                attachment: true,
                expires_at: Math.floor(Date.now() / 1000) + 60,
            }
        );

        return NextResponse.redirect(signedUrl, 302);
    } catch (error) {
        console.error("Recruiter CV download error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to download this CV.",
            },
            { status: 500 }
        );
    }
}
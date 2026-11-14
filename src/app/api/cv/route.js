import { NextResponse } from "next/server";
import { randomUUID } from "crypto";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";
import cloudinary from "@/lib/cloudinary/client";
import CV from "@/models/CV";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILES = {
    pdf: {
        mimeType: "application/pdf",
        signature: (buffer) =>
            buffer.subarray(0, 5).toString() === "%PDF-",
    },
    doc: {
        mimeType: "application/msword",
        signature: (buffer) =>
            buffer.subarray(0, 8).equals(
                Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1])
            ),
    },
    docx: {
        mimeType:
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        signature: (buffer) =>
            buffer[0] === 0x50 && buffer[1] === 0x4b,
    },
};

function jsonError(message, status) {
    return NextResponse.json(
        { success: false, message },
        { status }
    );
}

function sanitizeFilename(filename) {
    return filename
        .replaceAll("/", "_")
        .replaceAll("\\", "_")
        .replace(/[\r\n]/g, "_")
        .slice(0, 255);
}

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) return jsonError("Unauthorized.", 401);

        if (user.role !== "student") {
            return jsonError("Student access required.", 403);
        }

        await connectDB();

        const cvs = await CV.find({ userId: user._id })
            .select(
                "_id file.originalName file.mimeType file.sizeBytes version extractedSkills education experience isDefault createdAt updatedAt"
            )
            .sort({ isDefault: -1, updatedAt: -1 })
            .lean();

        const data = cvs.map((cv) => ({
            _id: cv._id,
            originalName: cv.file?.originalName || "Untitled CV",
            mimeType: cv.file?.mimeType || null,
            sizeBytes: cv.file?.sizeBytes || 0,
            version: cv.version,
            extractedSkills: cv.extractedSkills || [],
            education: cv.education || [],
            experience: cv.experience || [],
            isDefault: cv.isDefault,
            createdAt: cv.createdAt,
            updatedAt: cv.updatedAt,
        }));

        return NextResponse.json({
            success: true,
            data,
        });
    } catch (error) {
        console.error("GET student CVs error:", error);

        return jsonError("Unable to fetch your CVs.", 500);
    }
}

export async function POST(request) {
    let uploadedPublicId = null;

    try {
        const user = await getCurrentUser();

        if (!user) return jsonError("Unauthorized.", 401);

        if (user.role !== "student") {
            return jsonError("Student access required.", 403);
        }

        const formData = await request.formData();
        const file = formData.get("file");

        if (!file || typeof file.arrayBuffer !== "function") {
            return jsonError("Select a CV file to upload.", 400);
        }

        if (file.size < 1 || file.size > MAX_FILE_SIZE) {
            return jsonError("CV must be between 1 byte and 5 MB.", 400);
        }

        const originalName = file.name || "resume";
        const extension = originalName.split(".").pop()?.toLowerCase();
        const fileConfig = ALLOWED_FILES[extension];

        if (!fileConfig || file.type !== fileConfig.mimeType) {
            return jsonError(
                "Only PDF, DOC and DOCX files are supported.",
                400
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        if (!fileConfig.signature(buffer)) {
            return jsonError(
                "The file content does not match its file type.",
                400
            );
        }

        await connectDB();

        const latestCV = await CV.findOne({
            userId: user._id,
        })
            .sort({ version: -1 })
            .select("version")
            .lean();

        const version = (latestCV?.version || 0) + 1;
        const userId = String(user._id);

        const publicId =
            `interncheck/cvs/${userId}/${randomUUID()}.${extension}`;

        const dataUri =
            `data:${fileConfig.mimeType};base64,${buffer.toString("base64")}`;

        const uploadResult = await cloudinary.uploader.upload(dataUri, {
            resource_type: "raw",
            type: "authenticated",
            public_id: publicId,
            overwrite: false,
            use_filename: false,
            unique_filename: false,
            context: {
                owner_id: userId,
                cv_version: String(version),
            },
        });

        uploadedPublicId = uploadResult.public_id;

        const cv = await CV.create({
            userId: user._id,
            file: {
                storageProvider: "cloudinary",
                fileKey: uploadResult.public_id,
                originalName: sanitizeFilename(originalName),
                mimeType: fileConfig.mimeType,
                sizeBytes: file.size,
            },
            version,
            isDefault: true,
        });

        await CV.updateMany(
            {
                userId: user._id,
                _id: { $ne: cv._id },
                isDefault: true,
            },
            {
                $set: { isDefault: false },
            }
        );

        return NextResponse.json(
            {
                success: true,
                message: "CV uploaded successfully.",
                data: {
                    _id: cv._id,
                    originalName: cv.file.originalName,
                    mimeType: cv.file.mimeType,
                    sizeBytes: cv.file.sizeBytes,
                    version: cv.version,
                    isDefault: cv.isDefault,
                    createdAt: cv.createdAt,
                },
            },
            { status: 201 }
        );
    } catch (error) {
        if (uploadedPublicId) {
            try {
                await cloudinary.uploader.destroy(uploadedPublicId, {
                    resource_type: "raw",
                    type: "authenticated",
                    invalidate: true,
                });
            } catch (cleanupError) {
                console.error(
                    "Cloudinary CV cleanup failed:",
                    cleanupError
                );
            }
        }

        console.error("POST student CV upload error:", error);

        return jsonError(
            "Unable to upload your CV. Please try again.",
            500
        );
    }
}
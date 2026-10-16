
import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["url", "document", "observation", "other"],
            required: true,
        },
        sourceUrl: { type: String, trim: true, maxlength: 2000 },
        description: { type: String, trim: true, maxlength: 2000 },
        fileKey: { type: String, trim: true, maxlength: 500 },
        capturedAt: { type: Date, default: Date.now },
    },
    { _id: true }
);

const verificationRecordSchema = new mongoose.Schema(
    {
        internshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true,
            index: true,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        checkType: {
            type: String,
            enum: [
                "company_identity",
                "website",
                "contact_details",
                "compensation",
                "application_process",
                "listing_consistency",
                "other",
            ],
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "passed", "failed", "inconclusive"],
            default: "pending",
            required: true,
        },

        method: {
            type: String,
            enum: ["automated", "manual"],
            default: "manual",
        },

        evidence: {
            type: [evidenceSchema],
            default: [],
        },

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        notes: { type: String, trim: true, maxlength: 3000 },
        checkedAt: { type: Date, default: null },
        expiresAt: { type: Date, default: null },
    },
    { timestamps: true }
);

verificationRecordSchema.index({
    internshipId: 1,
    checkType: 1,
    createdAt: -1,
});

const VerificationRecord =
    mongoose.models.VerificationRecord ||
    mongoose.model("VerificationRecord", verificationRecordSchema);

export default VerificationRecord;

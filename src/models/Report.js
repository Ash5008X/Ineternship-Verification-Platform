
import mongoose from "mongoose";

const reportEvidenceSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["url", "document", "screenshot", "observation", "other"],
            required: true,
        },
        sourceUrl: { type: String, trim: true, maxlength: 2000 },
        description: { type: String, trim: true, maxlength: 2000 },
        fileKey: { type: String, trim: true, maxlength: 500 },
    },
    { _id: true }
);

const reportSchema = new mongoose.Schema(
    {
        reporterId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        internshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            default: null,
            index: true,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            default: null,
            index: true,
        },

        category: {
            type: String,
            enum: [
                "registration_fee",
                "payment_scam",
                "company_impersonation",
                "fake_listing",
                "misleading_information",
                "suspicious_contact",
                "other",
            ],
            required: true,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 5000,
        },

        evidence: {
            type: [reportEvidenceSchema],
            default: [],
        },

        moderationStatus: {
            type: String,
            enum: [
                "pending",
                "under_review",
                "substantiated",
                "unsubstantiated",
                "dismissed",
            ],
            default: "pending",
            index: true,
        },

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        resolution: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },

        resolvedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

reportSchema.index({
    internshipId: 1,
    moderationStatus: 1,
    createdAt: -1,
});

const Report =
    mongoose.models.Report || mongoose.model("Report", reportSchema);

export default Report;

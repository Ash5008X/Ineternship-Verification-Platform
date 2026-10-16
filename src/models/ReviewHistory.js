
import mongoose from "mongoose";

const reviewHistorySchema = new mongoose.Schema(
    {
        internshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true,
            index: true,
        },

        assessmentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RiskAssessment",
            default: null,
        },

        reviewerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        action: {
            type: String,
            enum: [
                "approve",
                "flag",
                "reject",
                "request_evidence",
                "reassess",
                "status_change",
                "other",
            ],
            required: true,
        },

        previousStatus: {
            type: String,
            default: null,
        },

        newStatus: {
            type: String,
            required: true,
        },

        reason: {
            type: String,
            required: true,
            trim: true,
            maxlength: 3000,
        },

        metadata: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
        },
    },
    { timestamps: true }
);

reviewHistorySchema.index({
    internshipId: 1,
    createdAt: -1,
});

const ReviewHistory =
    mongoose.models.ReviewHistory ||
    mongoose.model("ReviewHistory", reviewHistorySchema);

export default ReviewHistory;

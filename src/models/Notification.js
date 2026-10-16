
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        type: {
            type: String,
            enum: [
                "application_update",
                "verification_update",
                "risk_alert",
                "experience_update",
                "report_update",
                "system",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        message: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2000,
        },

        entityType: {
            type: String,
            enum: [
                "internship",
                "application",
                "riskAssessment",
                "report",
                "experience",
                "other",
            ],
            default: "other",
        },

        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },

        isRead: {
            type: Boolean,
            default: false,
        },

        readAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification =
    mongoose.models.Notification ||
    mongoose.model("Notification", notificationSchema);

export default Notification;

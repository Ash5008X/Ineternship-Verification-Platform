
import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        internshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            required: true,
        },

        cvId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "CV",
            default: null,
        },

        cvSnapshot: {
            version: { type: Number, min: 1, default: null },
            fileKey: { type: String, maxlength: 500, default: null },
        },

        applicationMethod: {
            type: String,
            enum: ["internal", "external"],
            required: true,
        },

        status: {
            type: String,
            enum: [
                "saved",
                "applied",
                "interviewing",
                "offered",
                "rejected",
                "withdrawn",
            ],
            default: "applied",
        },

        appliedAt: {
            type: Date,
            default: null,
        },

        notes: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },
    },
    { timestamps: true }
);

applicationSchema.index(
    { userId: 1, internshipId: 1 },
    { unique: true }
);

applicationSchema.index({ userId: 1, status: 1, updatedAt: -1 });

const Application =
    mongoose.models.Application ||
    mongoose.model("Application", applicationSchema);

export default Application;

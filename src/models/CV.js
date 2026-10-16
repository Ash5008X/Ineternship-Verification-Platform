
import mongoose from "mongoose";

const educationSchema = new mongoose.Schema(
    {
        institution: { type: String, trim: true, maxlength: 200 },
        degree: { type: String, trim: true, maxlength: 100 },
        graduationYear: { type: Number, min: 2000, max: 2100 },
    },
    { _id: false }
);

const experienceSchema = new mongoose.Schema(
    {
        title: { type: String, trim: true, maxlength: 150 },
        organization: { type: String, trim: true, maxlength: 200 },
        description: { type: String, trim: true, maxlength: 3000 },
        durationMonths: { type: Number, min: 0 },
    },
    { _id: false }
);

const cvSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        file: {
            storageProvider: {
                type: String,
                enum: ["s3", "cloudinary", "other"],
                required: true,
            },
            fileKey: { type: String, required: true, maxlength: 500 },
            originalName: { type: String, required: true, maxlength: 255 },
            mimeType: { type: String, required: true, maxlength: 100 },
            sizeBytes: { type: Number, min: 1, required: true },
        },

        extractedSkills: {
            type: [{ type: String, trim: true, maxlength: 80 }],
            default: [],
        },

        education: {
            type: [educationSchema],
            default: [],
        },

        experience: {
            type: [experienceSchema],
            default: [],
        },

        version: {
            type: Number,
            min: 1,
            required: true,
            default: 1,
        },

        isDefault: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

cvSchema.index({ userId: 1, version: -1 });

const CV = mongoose.models.CV || mongoose.model("CV", cvSchema);

export default CV;

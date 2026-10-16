
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        normalizedName: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
            maxlength: 200,
        },

        website: {
            type: String,
            trim: true,
            maxlength: 500,
            default: null,
        },

        domain: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 255,
            default: null,
        },

        description: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: "",
        },

        industry: {
            type: String,
            trim: true,
            maxlength: 100,
            default: null,
        },

        headquarters: {
            city: { type: String, trim: true, maxlength: 100 },
            state: { type: String, trim: true, maxlength: 100 },
            country: { type: String, trim: true, maxlength: 100 },
        },

        contactEmail: {
            type: String,
            trim: true,
            lowercase: true,
            maxlength: 254,
            default: null,
        },

        registrationDetails: {
            registrationNumber: { type: String, trim: true, maxlength: 150 },
            jurisdiction: { type: String, trim: true, maxlength: 150 },
            sourceUrl: { type: String, trim: true, maxlength: 1000 },
            checkedAt: { type: Date, default: null },
        },

        identityStatus: {
            type: String,
            enum: ["unverified", "pending", "verified", "rejected"],
            default: "unverified",
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },
    },
    { timestamps: true }
);

companySchema.index({ normalizedName: 1 });
companySchema.index({ domain: 1 });
companySchema.index({ identityStatus: 1 });

const Company =
    mongoose.models.Company ||
    mongoose.model("Company", companySchema);

export default Company;

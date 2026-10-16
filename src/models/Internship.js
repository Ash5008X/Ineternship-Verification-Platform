
import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
    {
        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 200,
        },

        description: {
            type: String,
            required: true,
            trim: true,
            maxlength: 20000,
        },

        category: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        requiredSkills: [{
            type: String,
            trim: true,
            maxlength: 80,
        }],

        preferredSkills: [{
            type: String,
            trim: true,
            maxlength: 80,
        }],

        stipend: {
            amount: { type: Number, min: 0, default: null },
            currency: { type: String, default: "INR", maxlength: 3 },
            period: {
                type: String,
                enum: ["hourly", "weekly", "monthly", "total", "unpaid", "unspecified"],
                default: "unspecified",
            },
        },

        duration: {
            value: { type: Number, min: 1, default: null },
            unit: {
                type: String,
                enum: ["days", "weeks", "months"],
                default: null,
            },
        },

        workMode: {
            type: String,
            enum: ["remote", "hybrid", "onsite", "unspecified"],
            default: "unspecified",
        },

        location: {
            city: { type: String, trim: true, maxlength: 100 },
            state: { type: String, trim: true, maxlength: 100 },
            country: { type: String, trim: true, maxlength: 100 },
        },

        eligibility: {
            degrees: [{ type: String, trim: true, maxlength: 100 }],
            graduationYears: [{ type: Number, min: 2000, max: 2100 }],
            minimumExperienceMonths: { type: Number, min: 0, default: null },
            otherRequirements: { type: String, trim: true, maxlength: 3000 },
        },

        applicationMethod: {
            type: String,
            enum: ["external", "internal"],
            default: "external",
        },

        applicationUrl: {
            type: String,
            trim: true,
            maxlength: 2000,
            default: null,
        },

        applicationDeadline: {
            type: Date,
            default: null,
        },

        source: {
            type: {
                type: String,
                enum: ["company", "job_board", "student", "admin", "other"],
                default: "other",
            },
            url: { type: String, trim: true, maxlength: 2000 },
            submittedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null,
            },
        },

        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        status: {
            type: String,
            enum: ["draft", "pending", "active", "expired", "withdrawn"],
            default: "pending",
        },
    },
    { timestamps: true }
);

internshipSchema.index({ status: 1, category: 1, createdAt: -1 });
internshipSchema.index({ companyId: 1, status: 1 });
internshipSchema.index({ applicationDeadline: 1 });

const Internship =
    mongoose.models.Internship ||
    mongoose.model("Internship", internshipSchema);

export default Internship;

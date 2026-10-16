
import mongoose from "mongoose";

const triggeredRuleSchema = new mongoose.Schema(
    {
        ruleId: { type: String, required: true, trim: true },
        description: { type: String, required: true, maxlength: 500 },
        weight: { type: Number, min: 0, max: 100, required: true },
        observed: { type: String, trim: true, maxlength: 1000 },
    },
    { _id: false }
);

const sourceReferenceSchema = new mongoose.Schema(
    {
        sourceType: {
            type: String,
            enum: ["verification", "report", "experience", "other"],
            required: true,
        },
        sourceId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },
    },
    { _id: false }
);

const riskAssessmentSchema = new mongoose.Schema(
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

        score: {
            type: Number,
            min: 0,
            max: 100,
            required: true,
        },

        severity: {
            type: String,
            enum: ["low", "medium", "high", "critical"],
            required: true,
        },

        triggeredRules: {
            type: [triggeredRuleSchema],
            default: [],
        },

        reasons: {
            type: [{ type: String, trim: true, maxlength: 500 }],
            default: [],
        },

        evidenceRefs: {
            type: [sourceReferenceSchema],
            default: [],
        },

        confidence: {
            type: Number,
            min: 0,
            max: 1,
            default: null,
        },

        status: {
            type: String,
            enum: ["pending", "completed", "needs_review", "superseded"],
            default: "completed",
        },

        ruleSetVersion: {
            type: String,
            required: true,
            default: "1.0.0",
        },

        assessedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: null,
        },

        assessedAt: { type: Date, default: Date.now },
    },
    { timestamps: true }
);

riskAssessmentSchema.index({
    internshipId: 1,
    assessedAt: -1,
});

riskAssessmentSchema.index({
    severity: 1,
    status: 1,
    assessedAt: -1,
});

const RiskAssessment =
    mongoose.models.RiskAssessment ||
    mongoose.model("RiskAssessment", riskAssessmentSchema);

export default RiskAssessment;

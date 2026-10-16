
import mongoose from "mongoose";

const studentExperienceSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },

        internshipId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Internship",
            default: null,
        },

        companyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
            index: true,
        },

        employmentStatus: {
            type: String,
            enum: [
                "applied",
                "interviewed",
                "offered",
                "interned",
                "completed",
                "rejected",
                "withdrawn",
            ],
            required: true,
        },

        applicationExperience: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: "",
        },

        interviewExperience: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: "",
        },

        workExperience: {
            type: String,
            trim: true,
            maxlength: 10000,
            default: "",
        },

        outcome: {
            type: String,
            trim: true,
            maxlength: 3000,
            default: "",
        },

        rating: {
            type: Number,
            min: 1,
            max: 5,
            default: null,
        },

        feedback: {
            type: String,
            trim: true,
            maxlength: 5000,
            default: "",
        },

        evidenceRefs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "VerificationRecord",
        }],

        moderationStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
            index: true,
        },
    },
    { timestamps: true }
);

studentExperienceSchema.index({
    companyId: 1,
    moderationStatus: 1,
    createdAt: -1,
});

const StudentExperience =
    mongoose.models.StudentExperience ||
    mongoose.model("StudentExperience", studentExperienceSchema);

export default StudentExperience;

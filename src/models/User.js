
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100,
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            maxlength: 254,
        },

        passwordHash: {
            type: String,
            required: true,
            select: false,
        },

        role: {
            type: String,
            enum: ["student", "reviewer", "admin"],
            default: "student",
            required: true,
        },

        avatarUrl: {
            type: String,
            trim: true,
            default: null,
        },

        profile: {
            college: { type: String, trim: true, maxlength: 200 },
            degree: { type: String, trim: true, maxlength: 100 },
            graduationYear: { type: Number, min: 2000, max: 2100 },
            bio: { type: String, trim: true, maxlength: 1000 },
            skills: [{ type: String, trim: true, maxlength: 80 }],
            linkedinUrl: { type: String, trim: true, maxlength: 500 },
        },

        isEmailVerified: {
            type: Boolean,
            default: false,
        },

        status: {
            type: String,
            enum: ["pending", "active", "suspended"],
            default: "pending",
        },
    },
    { timestamps: true }
);

userSchema.index({ role: 1, status: 1 });

const User =
    mongoose.models.User || mongoose.model("User", userSchema);

export default User;

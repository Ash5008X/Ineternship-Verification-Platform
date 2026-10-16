
import mongoose from "mongoose";

const bookmarkSchema = new mongoose.Schema(
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
    },
    { timestamps: true }
);

bookmarkSchema.index(
    { userId: 1, internshipId: 1 },
    { unique: true }
);

bookmarkSchema.index({ userId: 1, createdAt: -1 });

const Bookmark =
    mongoose.models.Bookmark ||
    mongoose.model("Bookmark", bookmarkSchema);

export default Bookmark;

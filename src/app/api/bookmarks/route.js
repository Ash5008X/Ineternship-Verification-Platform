
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";
import Bookmark from "@/models/Bookmark";
import Internship from "@/models/Internship";
import Company from "@/models/Company";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in to view bookmarks." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    await connectDB();

    const bookmarks = await Bookmark.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate({
        path: "internshipId",
        model: Internship,
        populate: {
          path: "companyId",
          model: Company,
          select: "name website industry headquarters",
        },
      })
      .lean();

    const data = bookmarks
      .filter((bookmark) => bookmark.internshipId)
      .map((bookmark) => ({
        bookmarkId: bookmark._id.toString(),
        savedAt: bookmark.createdAt,
        internship: {
          ...bookmark.internshipId,
          _id: bookmark.internshipId._id.toString(),
          company: bookmark.internshipId.companyId
            ? {
                ...bookmark.internshipId.companyId,
                _id: bookmark.internshipId.companyId._id.toString(),
              }
            : null,
        },
      }));

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Fetch bookmarks error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch bookmarks." },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Please log in first." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Access denied." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { internshipId } = body;

    if (!mongoose.isValidObjectId(internshipId)) {
      return NextResponse.json(
        { success: false, message: "Invalid internship ID." },
        { status: 400 }
      );
    }

    await connectDB();

    const deletedBookmark = await Bookmark.findOneAndDelete({
      userId: user._id,
      internshipId,
    });

    if (!deletedBookmark) {
      return NextResponse.json(
        { success: false, message: "Bookmark not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Bookmark removed successfully.",
    });
  } catch (error) {
    console.error("Remove bookmark error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to remove bookmark." },
      { status: 500 }
    );
  }
}

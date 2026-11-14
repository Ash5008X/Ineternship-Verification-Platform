
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";

import Bookmark from "@/models/Bookmark";
import Internship from "@/models/Internship";
import Company from "@/models/Company";

async function getStudent() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "student") {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Access denied. Student account required.",
        },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}

// GET: Fetch all bookmarks belonging to the logged-in student.
export async function GET() {
  try {
    const { user, response } = await getStudent();

    if (response) return response;

    await connectDB();

    const bookmarks = await Bookmark.find({
      userId: user._id,
    })
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
      .map((bookmark) => {
        const internship = bookmark.internshipId;
        const company = internship.companyId;

        return {
          bookmarkId: bookmark._id.toString(),
          savedAt: bookmark.createdAt,

          internship: {
            ...internship,
            _id: internship._id.toString(),

            company: company
              ? {
                  ...company,
                  _id: company._id.toString(),
                }
              : null,

            companyId: company
              ? company._id.toString()
              : null,
          },
        };
      });

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
    });
  } catch (error) {
    console.error("Fetch bookmarks error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch bookmarks.",
      },
      { status: 500 }
    );
  }
}

// POST: Add an internship to the student's bookmarks.
export async function POST(request) {
  try {
    const { user, response } = await getStudent();

    if (response) return response;

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const { internshipId } = body || {};

    if (
      !internshipId ||
      !mongoose.isValidObjectId(internshipId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid internship ID is required.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    // Only active internships are available to students.
    const internship = await Internship.findOne({
      _id: internshipId,
      status: "active",
    })
      .select("_id title companyId")
      .lean();

    if (!internship) {
      return NextResponse.json(
        {
          success: false,
          message: "Internship not found or is no longer available.",
        },
        { status: 404 }
      );
    }

    // Check whether the student already bookmarked this internship.
    const existingBookmark = await Bookmark.findOne({
      userId: user._id,
      internshipId: internship._id,
    }).lean();

    if (existingBookmark) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already bookmarked this internship.",
        },
        { status: 409 }
      );
    }

    const bookmark = await Bookmark.create({
      userId: user._id,
      internshipId: internship._id,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Internship bookmarked successfully.",
        data: {
          bookmarkId: bookmark._id.toString(),
          internshipId: internship._id.toString(),
          savedAt: bookmark.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    // Handles duplicate insertion caused by simultaneous requests.
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already bookmarked this internship.",
        },
        { status: 409 }
      );
    }

    console.error("Create bookmark error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to bookmark internship.",
      },
      { status: 500 }
    );
  }
}

// DELETE: Remove an internship from the student's bookmarks.
export async function DELETE(request) {
  try {
    const { user, response } = await getStudent();

    if (response) return response;

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const { internshipId } = body || {};

    if (
      !internshipId ||
      !mongoose.isValidObjectId(internshipId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid internship ID is required.",
        },
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
        {
          success: false,
          message: "Bookmark not found.",
        },
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
      {
        success: false,
        message: "Unable to remove bookmark.",
      },
      { status: 500 }
    );
  }
}

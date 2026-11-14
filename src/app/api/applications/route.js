
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";

import Application from "@/models/Application";
import Internship from "@/models/Internship";
import CV from "@/models/CV";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 }
      );
    }

    await connectDB();

    const applications = await Application.find({
      userId: user._id,
    })
      .populate({
        path: "internshipId",
        select:
          "title category stipend duration workMode location applicationMethod applicationUrl applicationDeadline companyId",
        populate: {
          path: "companyId",
          select: "name logo website",
        },
      })
      .populate({
        path: "cvId",
        select: "version file.originalName",
      })
      .sort({ appliedAt: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("GET applications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch applications." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    if (user.role !== "student") {
      return NextResponse.json(
        { success: false, message: "Student access required." },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    const {
      internshipId,
      cvId,
      notes = "",
      confirmExternal = false,
    } = body;

    if (!mongoose.Types.ObjectId.isValid(internshipId)) {
      return NextResponse.json(
        { success: false, message: "Invalid internship ID." },
        { status: 400 }
      );
    }

    if (notes.length > 3000) {
      return NextResponse.json(
        { success: false, message: "Notes cannot exceed 3000 characters." },
        { status: 400 }
      );
    }

    const internship = await Internship.findOne({
      _id: internshipId,
      status: "active",
    }).lean();

    if (!internship) {
      return NextResponse.json(
        { success: false, message: "Internship is unavailable." },
        { status: 404 }
      );
    }

    const applicationMethod = internship.applicationMethod;

    if (
      applicationMethod === "external" &&
      confirmExternal !== true
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Confirm that you have submitted the application on the company website.",
        },
        { status: 400 }
      );
    }

    const existing = await Application.findOne({
      userId: user._id,
      internshipId,
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already recorded an application for this internship.",
        },
        { status: 409 }
      );
    }

    let cv = null;

    if (cvId) {
      if (!mongoose.Types.ObjectId.isValid(cvId)) {
        return NextResponse.json(
          { success: false, message: "Invalid CV ID." },
          { status: 400 }
        );
      }

      cv = await CV.findOne({
        _id: cvId,
        userId: user._id,
      }).lean();

      if (!cv) {
        return NextResponse.json(
          { success: false, message: "CV not found." },
          { status: 404 }
        );
      }
    }

    const application = await Application.create({
      userId: user._id,
      internshipId,
      cvId: cv?._id || null,
      cvSnapshot: cv
        ? {
            version: cv.version,
            fileKey: cv.file?.fileKey || null,
          }
        : undefined,
      applicationMethod,
      status: "applied",
      appliedAt: new Date(),
      notes: notes.trim(),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Application recorded successfully.",
        data: application,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "You have already applied to this internship.",
        },
        { status: 409 }
      );
    }

    console.error("POST applications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to record application." },
      { status: 500 }
    );
  }
}

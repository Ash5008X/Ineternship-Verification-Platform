
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";
import Application from "@/models/Application";

export async function PATCH(request, { params }) {
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

    const { applicationId } = await params;

    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
      return NextResponse.json(
        { success: false, message: "Invalid application ID." },
        { status: 400 }
      );
    }

    const body = await request.json();

    if (body.status !== "withdrawn") {
      return NextResponse.json(
        { success: false, message: "Only withdrawal is permitted here." },
        { status: 400 }
      );
    }

    await connectDB();

    const application = await Application.findOne({
      _id: applicationId,
      userId: user._id,
    });

    if (!application) {
      return NextResponse.json(
        { success: false, message: "Application not found." },
        { status: 404 }
      );
    }

    if (!["applied", "interviewing"].includes(application.status)) {
      return NextResponse.json(
        {
          success: false,
          message: "This application can no longer be withdrawn.",
        },
        { status: 409 }
      );
    }

    application.status = "withdrawn";
    await application.save();

    return NextResponse.json({
      success: true,
      message: "Application withdrawn successfully.",
      data: application,
    });
  } catch (error) {
    console.error("PATCH application error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to withdraw application." },
      { status: 500 }
    );
  }
}

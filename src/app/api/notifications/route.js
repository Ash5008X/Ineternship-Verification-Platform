
import { NextResponse } from "next/server";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";
import Notification from "@/models/Notification";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const notifications = await Notification.find({
      userId: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    const unreadCount = await Notification.countDocuments({
      userId: user._id,
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("GET notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to fetch notifications." },
      { status: 500 }
    );
  }
}

export async function PATCH() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await connectDB();

    const result = await Notification.updateMany(
      {
        userId: user._id,
        isRead: false,
      },
      {
        $set: {
          isRead: true,
          readAt: new Date(),
        },
      }
    );

    return NextResponse.json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: result.modifiedCount,
      unreadCount: 0,
    });
  } catch (error) {
    console.error("PATCH notifications error:", error);

    return NextResponse.json(
      { success: false, message: "Unable to update notifications." },
      { status: 500 }
    );
  }
}

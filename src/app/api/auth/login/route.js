
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import {
    createAuthToken,
    getAuthCookieOptions,
} from "@/lib/auth/auth";

export async function POST(request) {
    try {
        await connectDB();

        const body = await request.json();

        const email = body.email?.trim().toLowerCase();
        const password = body.password;

        if (!email || typeof password !== "string" || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email and password are required.",
                },
                { status: 400 }
            );
        }

        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        if (user.status === "suspended") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Your account has been suspended.",
                },
                { status: 403 }
            );
        }

        const token = createAuthToken(user);

        const response = NextResponse.json({
            success: true,
            message: "Login successful.",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                profile: user.profile,
                recruiterProfile: user.recruiterProfile,
            },
        });

        response.cookies.set(
            "interncheck_token",
            token,
            getAuthCookieOptions()
        );

        return response;
    } catch (error) {
        console.error("Login error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to log in. Please try again.",
            },
            { status: 500 }
        );
    }
}

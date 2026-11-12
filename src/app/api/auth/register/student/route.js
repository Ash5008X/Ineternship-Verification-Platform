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

        const name = body.name?.trim();
        const email = body.email?.trim().toLowerCase();
        const password = body.password;
        const college = body.college?.trim();
        const degree = body.degree?.trim();
        const graduationYear = Number(body.graduationYear);

        if (!name || name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Enter a valid full name." },
                { status: 400 }
            );
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid email address." },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 8 || password.length > 128) {
            return NextResponse.json(
                { success: false, message: "Password must be between 8 and 128 characters." },
                { status: 400 }
            );
        }

        if (!college || college.length > 200 || !degree) {
            return NextResponse.json(
                { success: false, message: "College and degree are required." },
                { status: 400 }
            );
        }

        const currentYear = new Date().getFullYear();

        if (
            !Number.isInteger(graduationYear) ||
            graduationYear < currentYear ||
            graduationYear > currentYear + 10
        ) {
            return NextResponse.json(
                { success: false, message: "Select a valid graduation year." },
                { status: 400 }
            );
        }

        const existingUser = await User.findOne({ email }).select("_id");

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: "student",
            status: "active",
            profile: {
                college,
                degree,
                graduationYear,
            },
        });

        const token = createAuthToken(user);

        const response = NextResponse.json(
            {
                success: true,
                message: "Student account created successfully.",
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    profile: user.profile,
                },
            },
            { status: 201 }
        );

        response.cookies.set(
            "interncheck_token",
            token,
            getAuthCookieOptions()
        );

        return response;
    } catch (error) {
        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "An account with this email already exists." },
                { status: 409 }
            );
        }

        console.error("Student registration error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to create your account." },
            { status: 500 }
        );
    }
}
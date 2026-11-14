import { NextResponse } from "next/server";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";
import User from "@/models/User";

export const dynamic = "force-dynamic";

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

        return NextResponse.json({
            success: true,
            data: {
                id: user._id,
                name: user.name || "",
                email: user.email || "",
                avatarUrl: user.avatarUrl || null,
                profile: {
                    college: user.profile?.college || "",
                    degree: user.profile?.degree || "",
                    graduationYear: user.profile?.graduationYear || "",
                    bio: user.profile?.bio || "",
                    skills: user.profile?.skills || [],
                    linkedinUrl: user.profile?.linkedinUrl || "",
                },
            },
        });
    } catch (error) {
        console.error("GET student profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to fetch profile." },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
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

        const body = await request.json();

        const name = typeof body.name === "string"
            ? body.name.trim()
            : "";

        const profile = body.profile || {};

        const college = typeof profile.college === "string"
            ? profile.college.trim()
            : "";

        const degree = typeof profile.degree === "string"
            ? profile.degree.trim()
            : "";

        const bio = typeof profile.bio === "string"
            ? profile.bio.trim()
            : "";

        const linkedinUrl = typeof profile.linkedinUrl === "string"
            ? profile.linkedinUrl.trim()
            : "";

        const skills = Array.isArray(profile.skills)
            ? [...new Set(
                profile.skills
                    .filter((skill) => typeof skill === "string")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
            )]
            : [];

        const graduationYear = profile.graduationYear === ""
            ? undefined
            : Number(profile.graduationYear);

        if (!name || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Enter a valid name." },
                { status: 400 }
            );
        }

        if (college.length > 200 || degree.length > 100 || bio.length > 1000) {
            return NextResponse.json(
                { success: false, message: "One or more profile fields are too long." },
                { status: 400 }
            );
        }

        if (linkedinUrl.length > 500) {
            return NextResponse.json(
                { success: false, message: "LinkedIn URL is too long." },
                { status: 400 }
            );
        }

        if (
            graduationYear !== undefined &&
            (!Number.isInteger(graduationYear) ||
                graduationYear < 2000 ||
                graduationYear > 2100)
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid graduation year." },
                { status: 400 }
            );
        }

        if (skills.length > 50 || skills.some((skill) => skill.length > 80)) {
            return NextResponse.json(
                { success: false, message: "Please check your skills list." },
                { status: 400 }
            );
        }

        if (
            linkedinUrl &&
            !/^https:\/\/(www\.)?linkedin\.com\//i.test(linkedinUrl)
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid LinkedIn profile URL." },
                { status: 400 }
            );
        }

        await connectDB();

        const update = {
            name,
            "profile.college": college,
            "profile.degree": degree,
            "profile.bio": bio,
            "profile.skills": skills,
            "profile.linkedinUrl": linkedinUrl,
        };

        if (graduationYear === undefined) {
            await User.updateOne(
                { _id: user._id, role: "student" },
                {
                    $set: update,
                    $unset: { "profile.graduationYear": 1 },
                }
            );
        } else {
            update["profile.graduationYear"] = graduationYear;

            await User.updateOne(
                { _id: user._id, role: "student" },
                { $set: update }
            );
        }

        const updatedUser = await User.findById(user._id)
            .select("-passwordHash")
            .lean();

        if (!updatedUser) {
            return NextResponse.json(
                { success: false, message: "User account not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Profile updated successfully.",
            data: {
                id: updatedUser._id,
                name: updatedUser.name || "",
                email: updatedUser.email || "",
                avatarUrl: updatedUser.avatarUrl || null,
                profile: {
                    college: updatedUser.profile?.college || "",
                    degree: updatedUser.profile?.degree || "",
                    graduationYear: updatedUser.profile?.graduationYear || "",
                    bio: updatedUser.profile?.bio || "",
                    skills: updatedUser.profile?.skills || [],
                    linkedinUrl: updatedUser.profile?.linkedinUrl || "",
                },
            },
        });
    } catch (error) {
        console.error("PATCH student profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to save profile changes." },
            { status: 500 }
        );
    }
}
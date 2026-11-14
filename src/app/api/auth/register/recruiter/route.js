import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import Company from "@/models/Company";
import {
    createAuthToken,
    getAuthCookieOptions,
} from "@/lib/auth/auth";

export async function POST(request) {
    let createdUser = null;

    try {
        await connectDB();

        const body = await request.json();

        const name = body.fullName?.trim();
        const email = body.workEmail?.trim().toLowerCase();
        const companyName = body.companyName?.trim();
        const jobTitle = body.jobTitle?.trim();
        const password = body.password;
        const websiteInput = body.companyWebsite?.trim() || "";

        if (!name || name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Enter a valid full name." },
                { status: 400 }
            );
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return NextResponse.json(
                { success: false, message: "Enter a valid work email." },
                { status: 400 }
            );
        }

        if (!companyName || companyName.length > 200 || !jobTitle || jobTitle.length > 120) {
            return NextResponse.json(
                { success: false, message: "Company name and job title are required." },
                { status: 400 }
            );
        }

        if (typeof password !== "string" || password.length < 8 || password.length > 128) {
            return NextResponse.json(
                { success: false, message: "Password must be between 8 and 128 characters." },
                { status: 400 }
            );
        }

        let website = null;
        let domain = null;

        if (websiteInput) {
            try {
                const normalizedWebsite = websiteInput.startsWith("http")
                    ? websiteInput
                    : `https://${websiteInput}`;

                const parsedWebsite = new URL(normalizedWebsite);

                if (!["http:", "https:"].includes(parsedWebsite.protocol)) {
                    throw new Error("Invalid protocol");
                }

                website = parsedWebsite.origin;
                domain = parsedWebsite.hostname.toLowerCase().replace(/^www\./, "");
            } catch {
                return NextResponse.json(
                    { success: false, message: "Enter a valid company website." },
                    { status: 400 }
                );
            }
        }

        const normalizedName = companyName.toLowerCase().replace(/\s+/g, " ").trim();

        const existingUser = await User.findOne({ email }).select("_id");

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "An account with this email already exists." },
                { status: 409 }
            );
        }

        const existingCompany = await Company.findOne({ normalizedName }).select("_id");

        if (existingCompany) {
            return NextResponse.json(
                {
                    success: false,
                    message: "This company is already registered. Contact its existing account owner.",
                },
                { status: 409 }
            );
        }

        const passwordHash = await bcrypt.hash(password, 12);

        createdUser = await User.create({
            name,
            email,
            passwordHash,
            role: "recruiter",
            status: "active",
            recruiterProfile: {
                jobTitle,
            },
        });

        const company = await Company.create({
            name: companyName,
            normalizedName,
            website,
            domain,
            contactEmail: email,
            identityStatus: "pending",
            createdBy: createdUser._id,
        });

        const token = createAuthToken(createdUser);

        const response = NextResponse.json(
            {
                success: true,
                message: "Recruiter account created successfully.",
                user: {
                    id: createdUser._id,
                    name: createdUser.name,
                    email: createdUser.email,
                    role: createdUser.role,
                    recruiterProfile: createdUser.recruiterProfile,
                },
                company: {
                    id: company._id,
                    name: company.name,
                    identityStatus: company.identityStatus,
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
        if (createdUser?._id) {
            await User.deleteOne({ _id: createdUser._id }).catch(() => {});
        }

        if (error.code === 11000) {
            return NextResponse.json(
                { success: false, message: "This account or company is already registered." },
                { status: 409 }
            );
        }

        console.error("Recruiter registration error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to create your recruiter account." },
            { status: 500 }
        );
    }
}
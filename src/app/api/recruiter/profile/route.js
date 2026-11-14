
import { NextResponse } from "next/server";

import { connectDB } from "@/config/db";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

import User from "@/models/User";
import Company from "@/models/Company";

export const dynamic = "force-dynamic";

function serializeProfile(user, company) {
    return {
        recruiter: {
            id: user._id.toString(),
            name: user.name || "",
            email: user.email || "",
            jobTitle: user.recruiterProfile?.jobTitle || "",
            avatarUrl: user.avatarUrl || null,
        },
        company: {
            id: company._id.toString(),
            name: company.name || "",
            website: company.website || "",
            description: company.description || "",
            industry: company.industry || "",
            contactEmail: company.contactEmail || "",
            headquarters: {
                city: company.headquarters?.city || "",
                state: company.headquarters?.state || "",
                country: company.headquarters?.country || "",
            },
            identityStatus: company.identityStatus || "unverified",
        },
    };
}

function normalizeWebsite(value) {
    if (!value) return null;

    const input = value.startsWith("http") ? value : `https://${value}`;
    const parsed = new URL(input);

    if (!["http:", "https:"].includes(parsed.protocol)) {
        throw new Error("Enter a valid company website.");
    }

    return parsed.origin;
}

export async function GET() {
    try {
        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.status }
            );
        }

        await connectDB();

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No company is associated with this recruiter account.",
                },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: serializeProfile(user, company),
        });
    } catch (error) {
        console.error("GET recruiter profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to load recruiter profile." },
            { status: 500 }
        );
    }
}

export async function PATCH(request) {
    try {
        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.status }
            );
        }

        await connectDB();

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No company is associated with this recruiter account.",
                },
                { status: 404 }
            );
        }

        const body = await request.json();

        const recruiter = body.recruiter || {};
        const companyData = body.company || {};
        const headquarters = companyData.headquarters || {};

        const name = typeof recruiter.name === "string"
            ? recruiter.name.trim()
            : "";

        const jobTitle = typeof recruiter.jobTitle === "string"
            ? recruiter.jobTitle.trim()
            : "";

        const companyName = typeof companyData.name === "string"
            ? companyData.name.trim()
            : "";

        const websiteInput = typeof companyData.website === "string"
            ? companyData.website.trim()
            : "";

        const description = typeof companyData.description === "string"
            ? companyData.description.trim()
            : "";

        const industry = typeof companyData.industry === "string"
            ? companyData.industry.trim()
            : "";

        const contactEmail = typeof companyData.contactEmail === "string"
            ? companyData.contactEmail.trim().toLowerCase()
            : "";

        const city = typeof headquarters.city === "string"
            ? headquarters.city.trim()
            : "";

        const state = typeof headquarters.state === "string"
            ? headquarters.state.trim()
            : "";

        const country = typeof headquarters.country === "string"
            ? headquarters.country.trim()
            : "";

        if (!name || name.length < 2 || name.length > 100) {
            return NextResponse.json(
                { success: false, message: "Enter a valid recruiter name." },
                { status: 400 }
            );
        }

        if (!jobTitle || jobTitle.length > 120) {
            return NextResponse.json(
                { success: false, message: "Enter a valid job title." },
                { status: 400 }
            );
        }

        if (!companyName || companyName.length > 200) {
            return NextResponse.json(
                { success: false, message: "Enter a valid company name." },
                { status: 400 }
            );
        }

        if (
            description.length > 5000 ||
            industry.length > 100 ||
            city.length > 100 ||
            state.length > 100 ||
            country.length > 100
        ) {
            return NextResponse.json(
                { success: false, message: "One or more company fields are too long." },
                { status: 400 }
            );
        }

        if (
            contactEmail &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
        ) {
            return NextResponse.json(
                { success: false, message: "Enter a valid company contact email." },
                { status: 400 }
            );
        }

        let website = null;

        try {
            website = normalizeWebsite(websiteInput);
        } catch {
            return NextResponse.json(
                { success: false, message: "Enter a valid company website." },
                { status: 400 }
            );
        }

        const normalizedName = companyName
            .toLowerCase()
            .replace(/\s+/g, " ")
            .trim();

        const duplicateCompany = await Company.findOne({
            normalizedName,
            _id: { $ne: company._id },
        }).select("_id");

        if (duplicateCompany) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Another company with this name is already registered.",
                },
                { status: 409 }
            );
        }

        const domain = website
            ? new URL(website).hostname.toLowerCase().replace(/^www\./, "")
            : null;

        await Promise.all([
            User.updateOne(
                { _id: user._id, role: "recruiter" },
                {
                    $set: {
                        name,
                        "recruiterProfile.jobTitle": jobTitle,
                    },
                }
            ),

            Company.updateOne(
                { _id: company._id, createdBy: user._id },
                {
                    $set: {
                        name: companyName,
                        normalizedName,
                        website,
                        domain,
                        description,
                        industry: industry || null,
                        contactEmail: contactEmail || null,
                        headquarters: {
                            city,
                            state,
                            country,
                        },
                    },
                }
            ),
        ]);

        const [updatedUser, updatedCompany] = await Promise.all([
            User.findById(user._id).select("-passwordHash").lean(),
            Company.findById(company._id).lean(),
        ]);

        if (!updatedUser || !updatedCompany) {
            return NextResponse.json(
                { success: false, message: "Unable to retrieve the updated profile." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            message: "Recruiter profile updated successfully.",
            data: serializeProfile(updatedUser, updatedCompany),
        });
    } catch (error) {
        console.error("PATCH recruiter profile error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to save recruiter profile." },
            { status: 500 }
        );
    }
}

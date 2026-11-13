
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

const ALLOWED_FIELDS = [
    "title",
    "description",
    "category",
    "requiredSkills",
    "preferredSkills",
    "stipend",
    "duration",
    "workMode",
    "location",
    "eligibility",
    "applicationMethod",
    "applicationUrl",
    "applicationDeadline",
];


function validateNestedFields(body) {
    const objectFields = [
        "stipend",
        "duration",
        "location",
        "eligibility",
    ];

    for (const field of objectFields) {
        if (
            Object.hasOwn(body, field) &&
            body[field] !== null &&
            (
                typeof body[field] !== "object" ||
                Array.isArray(body[field])
            )
        ) {
            return false;
        }
    }

    const arrayFields = [
        "requiredSkills",
        "preferredSkills",
    ];

    for (const field of arrayFields) {
        if (
            Object.hasOwn(body, field) &&
            !Array.isArray(body[field])
        ) {
            return false;
        }
    }

    return true;
}


function validateWebsite(value) {
    if (typeof value !== "string") return false;

    try {
        const url = new URL(value);

        return (
            ["http:", "https:"].includes(url.protocol) &&
            Boolean(url.hostname) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
}

export async function POST(request) {
    try {
        await connectDB();

        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                { success: false, message: error.message },
                { status: error.status }
            );
        }

        const company = await getRecruiterCompany(user._id);

        if (!company) {
            return NextResponse.json(
                {
                    success: false,
                    message: "No company is associated with this recruiter.",
                },
                { status: 404 }
            );
        }

        let body;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, message: "Invalid JSON request body." },
                { status: 400 }
            );
        }

        if (
            !body ||
            typeof body !== "object" ||
            Array.isArray(body)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid internship data." },
                { status: 400 }
            );
        }

        // Ownership and status fields are always controlled by the server.
        if (
            Object.hasOwn(body, "companyId") ||
            Object.hasOwn(body, "createdBy") ||
            Object.hasOwn(body, "status") ||
            Object.hasOwn(body, "source")
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Ownership and status fields cannot be supplied.",
                },
                { status: 400 }
            );
        }

        const unknownFields = Object.keys(body).filter(
            (key) => !ALLOWED_FIELDS.includes(key)
        );

        if (unknownFields.length > 0) {
            return NextResponse.json(
                { success: false, message: "Request contains unsupported fields." },
                { status: 400 }
            );
        }


        if (!validateNestedFields(body)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid nested internship information.",
                },
                { status: 400 }
            );
        }


        if (body.stipend !== undefined && body.stipend !== null) {
            const { amount, currency, period } = body.stipend;

            if (
                amount !== undefined &&
                amount !== null &&
                (typeof amount !== "number" || !Number.isFinite(amount) || amount < 0)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend amount." },
                    { status: 400 }
                );
            }

            if (
                currency !== undefined &&
                (typeof currency !== "string" || !/^[A-Z]{3}$/.test(currency))
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend currency." },
                    { status: 400 }
                );
            }

            if (
                period !== undefined &&
                !["hourly", "weekly", "monthly", "total", "unpaid", "unspecified"].includes(period)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend period." },
                    { status: 400 }
                );
            }
        }


        if (body.duration !== undefined && body.duration !== null) {
            const { value, unit } = body.duration;

            if (
                value !== undefined &&
                value !== null &&
                (typeof value !== "number" || !Number.isFinite(value) || value < 1)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid internship duration." },
                    { status: 400 }
                );
            }

            if (
                unit !== undefined &&
                unit !== null &&
                !["days", "weeks", "months"].includes(unit)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid duration unit." },
                    { status: 400 }
                );
            }
        }


        if (
            body.workMode !== undefined &&
            !["remote", "hybrid", "onsite", "unspecified"].includes(body.workMode)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid work mode." },
                { status: 400 }
            );
        }


        if (body.applicationDeadline !== undefined && body.applicationDeadline !== null) {
            const deadline = new Date(body.applicationDeadline);

            if (
                typeof body.applicationDeadline !== "string" ||
                !Number.isFinite(deadline.getTime())
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid application deadline." },
                    { status: 400 }
                );
            }
        }


        const title = typeof body.title === "string" ? body.title.trim() : "";
        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : "";
        const category =
            typeof body.category === "string" ? body.category.trim() : "";

        const applicationMethod = body.applicationMethod ?? "external";

        if (!["external", "internal"].includes(applicationMethod)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application method must be external or internal.",
                },
                { status: 400 }
            );
        }

        if (
            applicationMethod === "external" &&
            !validateWebsite(body.applicationUrl)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid application URL is required for external applications.",
                },
                { status: 400 }
            );
        }

        if (
            applicationMethod === "internal" &&
            body.applicationUrl &&
            body.applicationUrl !== ""
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application URL should not be provided for internal applications.",
                },
                { status: 400 }
            );
        }


        if (!title || title.length > 200) {
            return NextResponse.json(
                { success: false, message: "A valid internship title is required." },
                { status: 400 }
            );
        }

        if (!description || description.length > 20000) {
            return NextResponse.json(
                { success: false, message: "A valid internship description is required." },
                { status: 400 }
            );
        }

        if (!category || category.length > 100) {
            return NextResponse.json(
                { success: false, message: "A valid internship category is required." },
                { status: 400 }
            );
        }


        if (
            body.applicationMethod === "external" &&
            !body.applicationUrl
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "An application URL is required for external applications.",
                },
                { status: 400 }
            );
        }


        if (
            body.applicationMethod === "internal" &&
            body.applicationUrl
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Application URL should not be provided for internal applications.",
                },
                { status: 400 }
            );
        }



        if (body.applicationDeadline !== undefined && body.applicationDeadline !== null) {
            const deadline = new Date(body.applicationDeadline);

            if (
                typeof body.applicationDeadline !== "string" ||
                !Number.isFinite(deadline.getTime())
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid application deadline." },
                    { status: 400 }
                );
            }
        }



        if (
            body.applicationUrl !== undefined &&
            body.applicationUrl !== null &&
            body.applicationUrl !== "" &&
            !validateWebsite(body.applicationUrl)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid application URL." },
                { status: 400 }
            );
        }

        const internship = await Internship.create({
            ...body,
            title,
            description,
            category,
            companyId: company._id,
            createdBy: user._id,
            status: "draft",
        });

        return NextResponse.json(
            {
                success: true,
                message: "Internship created successfully.",
                data: internship,
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Create Internship Error:", error);

        if (
            error instanceof mongoose.Error.ValidationError ||
            error instanceof mongoose.Error.CastError
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid internship information." },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Unable to create internship." },
            { status: 500 }
        );
    }
}



export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid pagination parameters." },
                { status: 400 }
            );
        }

        const filter = {
            status: "active",
            $and: [
                {
                    $or: [
                        { applicationDeadline: null },
                        { applicationDeadline: { $gte: new Date() } },
                    ],
                },
            ],
        };

        const q = searchParams.get("q")?.trim();
        const category = searchParams.get("category")?.trim();
        const city = searchParams.get("city")?.trim();
        const state = searchParams.get("state")?.trim();
        const country = searchParams.get("country")?.trim();
        const workMode = searchParams.get("workMode")?.trim();
        const skills = searchParams.get("skills")
            ?.split(",")
            .map((skill) => skill.trim())
            .filter(Boolean);

        const minStipend = searchParams.get("minStipend");
        const maxStipend = searchParams.get("maxStipend");

        const escapeRegex = (value) =>
            value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        if (q) {
            const searchRegex = new RegExp(escapeRegex(q), "i");

            filter.$and.push({
                $or: [
                    { title: searchRegex },
                    { description: searchRegex },
                    { category: searchRegex },
                    { requiredSkills: searchRegex },
                    { preferredSkills: searchRegex },
                ],
            });
        }

        if (category) {
            filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
        }

        if (city) {
            filter["location.city"] = new RegExp(escapeRegex(city), "i");
        }

        if (state) {
            filter["location.state"] = new RegExp(escapeRegex(state), "i");
        }

        if (country) {
            filter["location.country"] = new RegExp(escapeRegex(country), "i");
        }

        if (workMode) {
            const allowedModes = ["remote", "hybrid", "onsite", "unspecified"];

            if (!allowedModes.includes(workMode)) {
                return NextResponse.json(
                    { success: false, message: "Invalid work mode." },
                    { status: 400 }
                );
            }

            filter.workMode = workMode;
        }

        if (skills?.length) {
            if (
                skills.length > 20 ||
                skills.some((skill) => skill.length > 80)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid skills filter." },
                    { status: 400 }
                );
            }

            filter.requiredSkills = {
                $in: skills.map(
                    (skill) => new RegExp(`^${escapeRegex(skill)}$`, "i")
                ),
            };
        }

        if (minStipend !== null || maxStipend !== null) {
            const stipendFilter = {};

            if (minStipend !== null) {
                const value = Number(minStipend);

                if (!Number.isFinite(value) || value < 0) {
                    return NextResponse.json(
                        { success: false, message: "Invalid minimum stipend." },
                        { status: 400 }
                    );
                }

                stipendFilter.$gte = value;
            }

            if (maxStipend !== null) {
                const value = Number(maxStipend);

                if (!Number.isFinite(value) || value < 0) {
                    return NextResponse.json(
                        { success: false, message: "Invalid maximum stipend." },
                        { status: 400 }
                    );
                }

                stipendFilter.$lte = value;
            }

            if (
                stipendFilter.$gte !== undefined &&
                stipendFilter.$lte !== undefined &&
                stipendFilter.$gte > stipendFilter.$lte
            ) {
                return NextResponse.json(
                    { success: false, message: "Minimum stipend cannot exceed maximum stipend." },
                    { status: 400 }
                );
            }

            filter["stipend.amount"] = stipendFilter;
        }

        const allowedSorts = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            stipend_high: { "stipend.amount": -1 },
            stipend_low: { "stipend.amount": 1 },
            deadline: { applicationDeadline: 1 },
        };

        const sortBy = searchParams.get("sort") || "newest";

        if (!allowedSorts[sortBy]) {
            return NextResponse.json(
                { success: false, message: "Invalid sort option." },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        const [internships, total] = await Promise.all([
            Internship.find(filter)
                .populate("companyId", "name website identityStatus")
                .sort(allowedSorts[sortBy])
                .skip(skip)
                .limit(limit)
                .lean(),

            Internship.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            data: internships,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: skip + internships.length < total,
                hasPreviousPage: page > 1,
            },
        });

    } catch (error) {
        console.error("Fetch Internships Error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to retrieve internships." },
            { status: 500 }
        );
    }
}

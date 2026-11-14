
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import Company from "@/models/Company";
import RiskAssessment from "@/models/RiskAssessment";

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

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

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

function emptyResponse(page, limit) {
    return NextResponse.json({
        success: true,
        data: [],
        pagination: {
            page,
            limit,
            total: 0,
            totalPages: 0,
            hasNextPage: false,
            hasPreviousPage: page > 1,
        },
    });
}

// CREATE INTERNSHIP
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

        // Ownership and status fields are controlled by the server.
        const restrictedFields = [
            "companyId",
            "createdBy",
            "status",
            "source",
        ];

        if (restrictedFields.some((field) => Object.hasOwn(body, field))) {
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
                {
                    success: false,
                    message: "Request contains unsupported fields.",
                },
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

        // Validate stipend.
        if (body.stipend != null) {
            const { amount, currency, period } = body.stipend;

            if (
                amount !== undefined &&
                amount !== null &&
                (
                    typeof amount !== "number" ||
                    !Number.isFinite(amount) ||
                    amount < 0
                )
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend amount." },
                    { status: 400 }
                );
            }

            if (
                currency !== undefined &&
                (
                    typeof currency !== "string" ||
                    !/^[A-Z]{3}$/.test(currency)
                )
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend currency." },
                    { status: 400 }
                );
            }

            if (
                period !== undefined &&
                ![
                    "hourly",
                    "weekly",
                    "monthly",
                    "total",
                    "unpaid",
                    "unspecified",
                ].includes(period)
            ) {
                return NextResponse.json(
                    { success: false, message: "Invalid stipend period." },
                    { status: 400 }
                );
            }
        }

        // Validate duration.
        if (body.duration != null) {
            const { value, unit } = body.duration;

            if (
                value !== undefined &&
                value !== null &&
                (
                    typeof value !== "number" ||
                    !Number.isFinite(value) ||
                    value < 1
                )
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

        // Validate work mode.
        if (
            body.workMode !== undefined &&
            !["remote", "hybrid", "onsite", "unspecified"].includes(body.workMode)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid work mode." },
                { status: 400 }
            );
        }

        // Validate application method.
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
            body.applicationUrl != null &&
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

        // Validate application deadline.
        if (
            body.applicationDeadline !== undefined &&
            body.applicationDeadline !== null
        ) {
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

        // Validate required text fields.
        const title =
            typeof body.title === "string" ? body.title.trim() : "";

        const description =
            typeof body.description === "string"
                ? body.description.trim()
                : "";

        const category =
            typeof body.category === "string"
                ? body.category.trim()
                : "";

        if (!title || title.length > 200) {
            return NextResponse.json(
                { success: false, message: "A valid internship title is required." },
                { status: 400 }
            );
        }

        if (!description || description.length > 20000) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid internship description is required.",
                },
                { status: 400 }
            );
        }

        if (!category || category.length > 100) {
            return NextResponse.json(
                {
                    success: false,
                    message: "A valid internship category is required.",
                },
                { status: 400 }
            );
        }

        const internship = await Internship.create({
            ...body,
            title,
            description,
            category,
            applicationMethod,
            applicationUrl:
                applicationMethod === "internal"
                    ? undefined
                    : body.applicationUrl,
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
                {
                    success: false,
                    message: "Invalid internship information.",
                },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { success: false, message: "Unable to create internship." },
            { status: 500 }
        );
    }
}

// PUBLIC INTERNSHIP LISTING
export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 12);

        if (
            !Number.isInteger(page) ||
            page < 1 ||
            !Number.isInteger(limit) ||
            limit < 1 ||
            limit > 100
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid pagination parameters.",
                },
                { status: 400 }
            );
        }

        // Support both the existing q parameter and ash's search parameter.
        const search =
            searchParams.get("search")?.trim() ||
            searchParams.get("q")?.trim() ||
            "";

        const category = searchParams.get("category")?.trim();
        const location = searchParams.get("location")?.trim();
        const city = searchParams.get("city")?.trim();
        const state = searchParams.get("state")?.trim();
        const country = searchParams.get("country")?.trim();

        const workMode = searchParams.get("workMode");
        const verification = searchParams.get("verification");
        const risk = searchParams.get("risk");

        const minStipend = searchParams.get("minStipend");
        const maxStipend = searchParams.get("maxStipend");

        const durationMin = searchParams.get("durationMin");
        const durationMax = searchParams.get("durationMax");
        const durationUnit = searchParams.get("durationUnit");

        const sort = searchParams.get("sort") || "newest";

        const filters = [
            { status: "active" },
            {
                $or: [
                    { applicationDeadline: null },
                    { applicationDeadline: { $gte: new Date() } },
                ],
            },
        ];

        // Search internship fields and company name.
        if (search) {
            const expression = new RegExp(escapeRegex(search), "i");

            const matchingCompanies = await Company.find({
                name: expression,
            }).select("_id").lean();

            const companyIds = matchingCompanies.map(
                (company) => company._id
            );

            const searchConditions = [
                { title: expression },
                { description: expression },
                { category: expression },
                { requiredSkills: expression },
                { preferredSkills: expression },
            ];

            if (companyIds.length) {
                searchConditions.push({
                    companyId: { $in: companyIds },
                });
            }

            filters.push({ $or: searchConditions });
        }

        // Category filter.
        if (category) {
            filters.push({
                category: new RegExp(
                    `^${escapeRegex(category)}$`,
                    "i"
                ),
            });
        }

        // Work mode filter.
        if (workMode && workMode !== "all") {
            const allowedModes = [
                "remote",
                "hybrid",
                "onsite",
                "unspecified",
            ];

            if (!allowedModes.includes(workMode)) {
                return NextResponse.json(
                    { success: false, message: "Invalid work mode." },
                    { status: 400 }
                );
            }

            filters.push({ workMode });
        }

        // Location filters.
        const locationExpression = location
            ? new RegExp(escapeRegex(location), "i")
            : null;

        if (locationExpression) {
            filters.push({
                $or: [
                    { "location.city": locationExpression },
                    { "location.state": locationExpression },
                    { "location.country": locationExpression },
                ],
            });
        }

        for (const [field, value] of [
            ["city", city],
            ["state", state],
            ["country", country],
        ]) {
            if (value) {
                filters.push({
                    [`location.${field}`]: new RegExp(
                        escapeRegex(value),
                        "i"
                    ),
                });
            }
        }

        // Stipend filters.
        if (
            minStipend !== null ||
            maxStipend !== null
        ) {
            const stipendFilter = {};

            if (minStipend !== null) {
                const value = Number(minStipend);

                if (!Number.isFinite(value) || value < 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid minimum stipend.",
                        },
                        { status: 400 }
                    );
                }

                stipendFilter.$gte = value;
            }

            if (maxStipend !== null) {
                const value = Number(maxStipend);

                if (!Number.isFinite(value) || value < 0) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid maximum stipend.",
                        },
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
                    {
                        success: false,
                        message: "Minimum stipend cannot exceed maximum stipend.",
                    },
                    { status: 400 }
                );
            }

            filters.push({
                "stipend.amount": stipendFilter,
                "stipend.period": {
                    $nin: ["unpaid", "unspecified"],
                },
            });
        }

        // Duration filters.
        if (
            durationUnit &&
            !["days", "weeks", "months"].includes(durationUnit)
        ) {
            return NextResponse.json(
                { success: false, message: "Invalid duration unit." },
                { status: 400 }
            );
        }

        if (durationUnit) {
            filters.push({
                "duration.unit": durationUnit,
            });
        }

        if (durationMin !== null || durationMax !== null) {
            const durationFilter = {};

            if (durationMin !== null) {
                const value = Number(durationMin);

                if (!Number.isFinite(value) || value < 1) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid minimum duration.",
                        },
                        { status: 400 }
                    );
                }

                durationFilter.$gte = value;
            }

            if (durationMax !== null) {
                const value = Number(durationMax);

                if (!Number.isFinite(value) || value < 1) {
                    return NextResponse.json(
                        {
                            success: false,
                            message: "Invalid maximum duration.",
                        },
                        { status: 400 }
                    );
                }

                durationFilter.$lte = value;
            }

            if (
                durationFilter.$gte !== undefined &&
                durationFilter.$lte !== undefined &&
                durationFilter.$gte > durationFilter.$lte
            ) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Minimum duration cannot exceed maximum duration.",
                    },
                    { status: 400 }
                );
            }

            filters.push({
                "duration.value": durationFilter,
            });
        }

        // Company identity verification filter.
        if (
            verification === "verified" ||
            verification === "unverified"
        ) {
            const identityStatus =
                verification === "verified"
                    ? "verified"
                    : { $ne: "verified" };

            const matchingCompanies = await Company.find({
                identityStatus,
            }).select("_id").lean();

            const companyIds = matchingCompanies.map(
                (company) => company._id
            );

            if (!companyIds.length) {
                return emptyResponse(page, limit);
            }

            filters.push({
                companyId: { $in: companyIds },
            });
        } else if (verification && verification !== "all") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid verification filter.",
                },
                { status: 400 }
            );
        }

        // Risk severity filter using latest non-superseded assessment.
        if (risk && risk !== "all") {
            const allowedRisks = [
                "low",
                "medium",
                "high",
                "critical",
            ];

            if (!allowedRisks.includes(risk)) {
                return NextResponse.json(
                    { success: false, message: "Invalid risk filter." },
                    { status: 400 }
                );
            }

            const latestRiskResults = await RiskAssessment.aggregate([
                {
                    $match: {
                        status: { $ne: "superseded" },
                    },
                },
                {
                    $sort: { assessedAt: -1 },
                },
                {
                    $group: {
                        _id: "$internshipId",
                        severity: { $first: "$severity" },
                    },
                },
                {
                    $match: { severity: risk },
                },
            ]);

            const internshipIds = latestRiskResults.map(
                (item) => item._id
            );

            if (!internshipIds.length) {
                return emptyResponse(page, limit);
            }

            filters.push({
                _id: { $in: internshipIds },
            });
        }

        const query = { $and: filters };

        // Sorting.
        const sortOptions = {
            newest: { createdAt: -1 },
            latest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            stipend_high: { "stipend.amount": -1, createdAt: -1 },
            stipend_low: { "stipend.amount": 1, createdAt: -1 },
            "stipend-high": { "stipend.amount": -1, createdAt: -1 },
            "stipend-low": { "stipend.amount": 1, createdAt: -1 },
            deadline: { applicationDeadline: 1, createdAt: -1 },
        };

        if (!sortOptions[sort]) {
            return NextResponse.json(
                { success: false, message: "Invalid sort option." },
                { status: 400 }
            );
        }

        const skip = (page - 1) * limit;

        const total = await Internship.countDocuments(query);

        const internships = await Internship.find(query)
            .populate({
                path: "companyId",
                select: "name domain website industry headquarters identityStatus",
            })
            .sort(sortOptions[sort])
            .skip(skip)
            .limit(limit)
            .lean();

        // Retrieve latest assessments for the returned internships.
        const internshipIds = internships.map(
            (internship) => internship._id
        );

        const latestAssessments = internshipIds.length
            ? await RiskAssessment.aggregate([
                {
                    $match: {
                        internshipId: { $in: internshipIds },
                        status: { $ne: "superseded" },
                    },
                },
                {
                    $sort: { assessedAt: -1 },
                },
                {
                    $group: {
                        _id: "$internshipId",
                        score: { $first: "$score" },
                        severity: { $first: "$severity" },
                        status: { $first: "$status" },
                        assessedAt: { $first: "$assessedAt" },
                    },
                },
            ])
            : [];

        const riskByInternship = new Map(
            latestAssessments.map((assessment) => [
                assessment._id.toString(),
                assessment,
            ])
        );

        const data = internships.map((internship) => {
            const assessment = riskByInternship.get(
                internship._id.toString()
            );

            return {
                ...internship,
                company: internship.companyId,
                companyId:
                    internship.companyId?._id ||
                    internship.companyId,
                riskAssessment: assessment
                    ? {
                        score: assessment.score,
                        severity: assessment.severity,
                        status: assessment.status,
                        assessedAt: assessment.assessedAt,
                    }
                    : null,
            };
        });

        const totalPages = Math.ceil(total / limit);

        return NextResponse.json({
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        });

    } catch (error) {
        console.error("Fetch Internships API Error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to retrieve internships.",
            },
            { status: 500 }
        );
    }
}

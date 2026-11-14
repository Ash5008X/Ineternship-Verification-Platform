import { NextResponse } from "next/server";

import { connectDB } from "@/config/db";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

import StudentExperience from "@/models/StudentExperience";
import User from "@/models/User";
import Internship from "@/models/Internship";

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getCategory(rating) {
    if (rating >= 4) return "Positive";
    if (rating === 3) return "Neutral";
    return "Negative";
}

function serializeExperience(item) {
    const student = item.studentId;
    const internship = item.internshipId;

    return {
        _id: item._id.toString(),
        student: student
            ? {
                  name: student.name || "Student",
                  university: student.profile?.college || "University not specified",
              }
            : {
                  name: "Anonymous student",
                  university: "University not specified",
              },
        internship: internship
            ? {
                  title: internship.title || "Internship",
                  category: internship.category || "General",
              }
            : {
                  title: "Internship not specified",
                  category: "General",
              },
        employmentStatus: item.employmentStatus,
        applicationExperience: item.applicationExperience || "",
        interviewExperience: item.interviewExperience || "",
        workExperience: item.workExperience || "",
        outcome: item.outcome || "",
        rating: item.rating ?? null,
        category: item.rating ? getCategory(item.rating) : "Unrated",
        feedback: item.feedback || "",
        submittedAt: item.createdAt,
    };
}

export async function GET(request) {
    try {
        const { user, error } = await requireRecruiter();

        if (error) {
            return NextResponse.json(
                {
                    success: false,
                    message: error.message,
                },
                { status: error.status }
            );
        }

        await connectDB();

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

        const { searchParams } = new URL(request.url);

        const page = Math.max(
            1,
            Number(searchParams.get("page")) || 1
        );

        const limit = Math.min(
            50,
            Math.max(1, Number(searchParams.get("limit")) || 12)
        );

        const category = searchParams.get("category") || "";
        const search = (searchParams.get("search") || "").trim();

        if (
            category &&
            !["Positive", "Neutral", "Negative"].includes(category)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid feedback category.",
                },
                { status: 400 }
            );
        }

        const baseFilter = {
            companyId: company._id,
            moderationStatus: "approved",
        };

        const filter = { ...baseFilter };

        if (search) {
            const expression = new RegExp(
                escapeRegex(search),
                "i"
            );

            const [matchingStudents, matchingInternships] =
                await Promise.all([
                    User.find({
                        role: "student",
                        $or: [
                            { name: expression },
                            { "profile.college": expression },
                        ],
                    })
                        .select("_id")
                        .lean(),

                    Internship.find({
                        companyId: company._id,
                        title: expression,
                    })
                        .select("_id")
                        .lean(),
                ]);

            filter.$or = [
                {
                    studentId: {
                        $in: matchingStudents.map((item) => item._id),
                    },
                },
                {
                    internshipId: {
                        $in: matchingInternships.map((item) => item._id),
                    },
                },
                { feedback: expression },
                { applicationExperience: expression },
                { interviewExperience: expression },
                { workExperience: expression },
                { outcome: expression },
            ];
        }

        if (category) {
            if (category === "Positive") {
                filter.rating = { $gte: 4 };
            } else if (category === "Neutral") {
                filter.rating = 3;
            } else {
                filter.rating = { $gte: 1, $lte: 2 };
            }
        }

        const [
            experiences,
            total,
            overallStats,
            ratingDistribution,
        ] = await Promise.all([
            StudentExperience.find(filter)
                .populate({
                    path: "studentId",
                    select: "name profile.college",
                })
                .populate({
                    path: "internshipId",
                    select: "title category",
                })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            StudentExperience.countDocuments(filter),

            StudentExperience.aggregate([
                {
                    $match: baseFilter,
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        averageRating: { $avg: "$rating" },
                        positive: {
                            $sum: {
                                $cond: [
                                    { $gte: ["$rating", 4] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        neutral: {
                            $sum: {
                                $cond: [
                                    { $eq: ["$rating", 3] },
                                    1,
                                    0,
                                ],
                            },
                        },
                        negative: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$rating", 1] },
                                            { $lte: ["$rating", 2] },
                                        ],
                                    },
                                    1,
                                    0,
                                ],
                            },
                        },
                    },
                },
            ]),

            StudentExperience.aggregate([
                {
                    $match: {
                        ...baseFilter,
                        rating: { $gte: 1, $lte: 5 },
                    },
                },
                {
                    $group: {
                        _id: "$rating",
                        count: { $sum: 1 },
                    },
                },
            ]),
        ]);

        const stats = overallStats[0] || {
            total: 0,
            averageRating: 0,
            positive: 0,
            neutral: 0,
            negative: 0,
        };

        const distribution = {
            1: 0,
            2: 0,
            3: 0,
            4: 0,
            5: 0,
        };

        ratingDistribution.forEach((item) => {
            distribution[item._id] = item.count;
        });

        return NextResponse.json({
            success: true,
            data: experiences.map(serializeExperience),
            stats: {
                total: stats.total,
                averageRating: Number(
                    (stats.averageRating || 0).toFixed(1)
                ),
                positive: stats.positive,
                neutral: stats.neutral,
                negative: stats.negative,
                distribution,
            },
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        });
    } catch (error) {
        console.error("Recruiter feedback API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch student feedback.",
            },
            { status: 500 }
        );
    }
}
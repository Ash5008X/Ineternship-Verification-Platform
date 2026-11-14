
import { NextResponse } from "next/server";

import { connectDB } from "@/config/db";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

import Application from "@/models/Application";
import Internship from "@/models/Internship";
import User from "@/models/User";

const ALLOWED_STATUSES = [
    "applied",
    "interviewing",
    "offered",
    "rejected",
    "withdrawn",
];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function serializeApplication(application) {
    const student = application.userId;
    const internship = application.internshipId;
    const cv = application.cvId;

    return {
        _id: application._id,
        status: application.status,
        applicationMethod: application.applicationMethod,
        appliedAt: application.appliedAt,
        notes: application.notes,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,

        student: student
            ? {
                _id: student._id,
                name: student.name,
                email: student.email,
                avatarUrl: student.avatarUrl,
                profile: student.profile || {},
            }
            : null,

        internship: internship
            ? {
                _id: internship._id,
                title: internship.title,
                category: internship.category,
                status: internship.status,
            }
            : null,

        cv: cv
            ? {
                _id: cv._id,
                version: cv.version,
                originalName: cv.file?.originalName || null,
                mimeType: cv.file?.mimeType || null,
                sizeBytes: cv.file?.sizeBytes || null,
            }
            : null,

        cvSnapshot: application.cvSnapshot
            ? {
                version: application.cvSnapshot.version,
            }
            : null,
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
                    message: "No associated company found.",
                },
                { status: 404 }
            );
        }

        const { searchParams } = new URL(request.url);

        const page = Number(searchParams.get("page") || 1);
        const limit = Number(searchParams.get("limit") || 10);

        const status = searchParams.get("status") || "";
        const internshipId = searchParams.get("internshipId") || "";
        const search = (searchParams.get("search") || "").trim();

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

        if (status && !ALLOWED_STATUSES.includes(status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid application status filter.",
                },
                { status: 400 }
            );
        }

        if (
            internshipId &&
            !/^[a-f\d]{24}$/i.test(internshipId)
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Invalid internship ID.",
                },
                { status: 400 }
            );
        }

        // Only internships belonging to this recruiter are considered.
        const internshipQuery = {
            companyId: company._id,
            createdBy: user._id,
        };

        if (internshipId) {
            internshipQuery._id = internshipId;
        }

        const internships = await Internship.find(internshipQuery)
            .select("_id title category status")
            .lean();

        const internshipIds = internships.map(
            (internship) => internship._id
        );

        if (internshipIds.length === 0) {
            return NextResponse.json({
                success: true,
                data: [],
                pagination: {
                    page,
                    limit,
                    total: 0,
                    totalPages: 0,
                },
                stats: {
                    total: 0,
                    applied: 0,
                    interviewing: 0,
                    offered: 0,
                    rejected: 0,
                    withdrawn: 0,
                },
            });
        }

        const filters = {
            internshipId: {
                $in: internshipIds,
            },
            status: {
                $in: ALLOWED_STATUSES,
            },
        };

        if (status) {
            filters.status = status;
        }

        // Search by student name, email or college.
        if (search) {
            const expression = new RegExp(
                escapeRegex(search),
                "i"
            );

            const matchingStudents = await User.find({
                role: "student",
                $or: [
                    { name: expression },
                    { email: expression },
                    { "profile.college": expression },
                ],
            })
                .select("_id")
                .lean();

            filters.userId = {
                $in: matchingStudents.map(
                    (student) => student._id
                ),
            };
        }

        const [
            applications,
            total,
            groupedStats,
        ] = await Promise.all([
            Application.find(filters)
                .populate({
                    path: "userId",
                    select: "name email avatarUrl profile",
                })
                .populate({
                    path: "internshipId",
                    select: "title category status",
                })
                .populate({
                    path: "cvId",
                    select: "version file.originalName file.mimeType file.sizeBytes",
                })
                .sort({
                    appliedAt: -1,
                    createdAt: -1,
                })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            Application.countDocuments(filters),

            Application.aggregate([
                {
                    $match: {
                        internshipId: {
                            $in: internshipIds,
                        },
                        status: {
                            $in: ALLOWED_STATUSES,
                        },
                    },
                },
                {
                    $group: {
                        _id: "$status",
                        count: {
                            $sum: 1,
                        },
                    },
                },
            ]),
        ]);

        const stats = {
            total: 0,
            applied: 0,
            interviewing: 0,
            offered: 0,
            rejected: 0,
            withdrawn: 0,
        };

        for (const item of groupedStats) {
            stats[item._id] = item.count;
            stats.total += item.count;
        }

        return NextResponse.json({
            success: true,

            data: applications.map(serializeApplication),

            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },

            stats,
        });
    } catch (error) {
        console.error(
            "GET recruiter applications error:",
            error
        );

        return NextResponse.json(
            {
                success: false,
                message: "Unable to fetch recruiter applications.",
            },
            { status: 500 }
        );
    }
}

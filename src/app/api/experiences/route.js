
import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import StudentExperience from "@/models/StudentExperience";
import Company from "@/models/Company";

export async function GET(request) {
    try {
        await connectDB();

        const { searchParams } = new URL(request.url);

        const search = searchParams.get("search")?.trim() || "";
        const employmentStatus = searchParams.get("status") || "";
        const minRating = Number(searchParams.get("minRating") || 0);
        const sort = searchParams.get("sort") || "newest";

        const page = Math.max(1, Number(searchParams.get("page")) || 1);
        const limit = Math.min(
            30,
            Math.max(1, Number(searchParams.get("limit")) || 10)
        );

        const filter = {
            moderationStatus: "approved",
        };

        if (employmentStatus) {
            const allowedStatuses = [
                "applied",
                "interviewed",
                "offered",
                "interned",
                "completed",
                "rejected",
                "withdrawn",
            ];

            if (!allowedStatuses.includes(employmentStatus)) {
                return NextResponse.json(
                    { success: false, message: "Invalid employment status" },
                    { status: 400 }
                );
            }

            filter.employmentStatus = employmentStatus;
        }

        if (minRating > 0) {
            if (minRating > 5) {
                return NextResponse.json(
                    { success: false, message: "Invalid rating filter" },
                    { status: 400 }
                );
            }

            filter.rating = { $gte: minRating };
        }

        if (search) {
            const matchingCompanies = await Company.find({
                name: { $regex: search, $options: "i" },
            }).select("_id").lean();

            filter.companyId = {
                $in: matchingCompanies.map((company) => company._id),
            };
        }

        const sortOptions = {
            newest: { createdAt: -1 },
            oldest: { createdAt: 1 },
            highestRated: { rating: -1, createdAt: -1 },
        };

        const sortBy = sortOptions[sort] || sortOptions.newest;

        const [experiences, total] = await Promise.all([
            StudentExperience.find(filter)
                .populate({
                    path: "companyId",
                    select: "name industry website identityStatus headquarters",
                })
                .populate({
                    path: "internshipId",
                    select: "title category workMode",
                })
                .select(
                    "companyId internshipId employmentStatus applicationExperience interviewExperience workExperience outcome rating feedback createdAt"
                )
                .sort(sortBy)
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),

            StudentExperience.countDocuments(filter),
        ]);

        return NextResponse.json({
            success: true,
            data: experiences,
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
        console.error("Experiences API error:", error);

        return NextResponse.json(
            {
                success: false,
                message: "Failed to fetch experiences",
            },
            { status: 500 }
        );
    }
}

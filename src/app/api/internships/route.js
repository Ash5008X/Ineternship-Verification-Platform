
import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import Company from "@/models/Company";
import RiskAssessment from "@/models/RiskAssessment";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim() || "";
    const category = searchParams.get("category") || "";
    const location = searchParams.get("location")?.trim() || "";
    const workMode = searchParams.get("workMode") || "";
    const verification = searchParams.get("verification") || "";
    const risk = searchParams.get("risk") || "";

    const minStipend = searchParams.get("minStipend");
    const maxStipend = searchParams.get("maxStipend");
    const durationMin = searchParams.get("durationMin");
    const durationMax = searchParams.get("durationMax");
    const durationUnit = searchParams.get("durationUnit");

    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
    );

    const limit = Math.max(
      1,
      Math.min(50, Number.parseInt(searchParams.get("limit") || "12", 10) || 12)
    );

    const sort = searchParams.get("sort") || "latest";

    const filters = [{ status: "active" }];

    // Search internship fields and company name.
    if (search) {
      const expression = new RegExp(escapeRegex(search), "i");

      const matchingCompanies = await Company.find({
        name: expression,
      }).select("_id").lean();

      const companyIds = matchingCompanies.map((company) => company._id);

      const searchConditions = [
        { title: expression },
        { category: expression },
        { requiredSkills: expression },
        { preferredSkills: expression },
      ];

      if (companyIds.length) {
        searchConditions.push({ companyId: { $in: companyIds } });
      }

      filters.push({ $or: searchConditions });
    }

    if (category) {
      filters.push({
        category: new RegExp(`^${escapeRegex(category)}$`, "i"),
      });
    }

    if (workMode && workMode !== "all") {
      filters.push({ workMode });
    }

    if (location) {
      const expression = new RegExp(escapeRegex(location), "i");

      filters.push({
        $or: [
          { "location.city": expression },
          { "location.state": expression },
          { "location.country": expression },
        ],
      });
    }

    // Stipend filters only apply to paid internships.
    if (minStipend || maxStipend) {
      const stipendFilter = {};

      if (minStipend !== null && minStipend !== "") {
        const value = Number(minStipend);
        if (Number.isFinite(value) && value >= 0) {
          stipendFilter.$gte = value;
        }
      }

      if (maxStipend !== null && maxStipend !== "") {
        const value = Number(maxStipend);
        if (Number.isFinite(value) && value >= 0) {
          stipendFilter.$lte = value;
        }
      }

      if (Object.keys(stipendFilter).length) {
        filters.push({
          "stipend.amount": stipendFilter,
          "stipend.period": { $nin: ["unpaid", "unspecified"] },
        });
      }
    }

    // Duration filters.
    if (durationUnit && ["days", "weeks", "months"].includes(durationUnit)) {
      filters.push({ "duration.unit": durationUnit });
    }

    if (durationMin || durationMax) {
      const durationFilter = {};

      if (durationMin !== null && durationMin !== "") {
        const value = Number(durationMin);
        if (Number.isFinite(value) && value > 0) {
          durationFilter.$gte = value;
        }
      }

      if (durationMax !== null && durationMax !== "") {
        const value = Number(durationMax);
        if (Number.isFinite(value) && value > 0) {
          durationFilter.$lte = value;
        }
      }

      if (Object.keys(durationFilter).length) {
        filters.push({ "duration.value": durationFilter });
      }
    }

    // Company identity verification filter.
    if (verification === "verified" || verification === "unverified") {
      const identityStatus =
        verification === "verified" ? "verified" : { $ne: "verified" };

      const matchingCompanies = await Company.find({
        identityStatus,
      }).select("_id").lean();

      const companyIds = matchingCompanies.map((company) => company._id);

      if (!companyIds.length) {
        return emptyResponse(page, limit);
      }

      filters.push({ companyId: { $in: companyIds } });
    }

    // Filter using the latest non-superseded assessment per internship.
    if (["low", "medium", "high", "critical"].includes(risk)) {
      const latestRiskResults = await RiskAssessment.aggregate([
        {
          $match: {
            status: { $ne: "superseded" },
          },
        },
        { $sort: { assessedAt: -1 } },
        {
          $group: {
            _id: "$internshipId",
            severity: { $first: "$severity" },
          },
        },
        { $match: { severity: risk } },
      ]);

      const internshipIds = latestRiskResults.map((item) => item._id);

      if (!internshipIds.length) {
        return emptyResponse(page, limit);
      }

      filters.push({ _id: { $in: internshipIds } });
    }

    const query = { $and: filters };

    const sortOptions = {
      latest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "stipend-high": { "stipend.amount": -1, createdAt: -1 },
      "stipend-low": { "stipend.amount": 1, createdAt: -1 },
      deadline: { applicationDeadline: 1, createdAt: -1 },
    };

    const sortBy = sortOptions[sort] || sortOptions.latest;

    const total = await Internship.countDocuments(query);

    const internships = await Internship.find(query)
      .populate({
        path: "companyId",
        select: "name domain website industry headquarters identityStatus",
      })
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const internshipIds = internships.map((item) => item._id);

    const latestAssessments = internshipIds.length
      ? await RiskAssessment.aggregate([
          {
            $match: {
              internshipId: { $in: internshipIds },
              status: { $ne: "superseded" },
            },
          },
          { $sort: { assessedAt: -1 } },
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
      const assessment = riskByInternship.get(internship._id.toString());

      return {
        ...internship,
        company: internship.companyId,
        companyId: internship.companyId?._id || internship.companyId,
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


import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import { getCurrentUser } from "@/lib/auth/session";

import Report from "@/models/Report";
import Internship from "@/models/Internship";
import Company from "@/models/Company";

const VALID_CATEGORIES = [
  "registration_fee",
  "payment_scam",
  "company_impersonation",
  "fake_listing",
  "misleading_information",
  "suspicious_contact",
  "other",
];

const VALID_EVIDENCE_TYPES = [
  "url",
  "document",
  "screenshot",
  "observation",
  "other",
];

async function getStudent() {
  const user = await getCurrentUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Please log in first.",
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "student") {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          message: "Access denied. Student account required.",
        },
        { status: 403 }
      ),
    };
  }

  return {
    user,
    response: null,
  };
}

function serializeReport(report) {
  const internship = report.internshipId;
  const company = report.companyId;

  return {
    ...report,
    _id: report._id.toString(),

    internshipId: internship
      ? {
          ...internship,
          _id: internship._id.toString(),
          companyId: internship.companyId
            ? internship.companyId._id
              ? {
                  ...internship.companyId,
                  _id: internship.companyId._id.toString(),
                }
              : internship.companyId.toString()
            : null,
        }
      : null,

    companyId: company
      ? {
          ...company,
          _id: company._id.toString(),
        }
      : null,

    reporterId: report.reporterId?._id
      ? report.reporterId._id.toString()
      : report.reporterId?.toString(),
  };
}

// GET: Fetch reports submitted by the authenticated student.
export async function GET(request) {
  try {
    const { user, response } = await getStudent();

    if (response) return response;

    await connectDB();

    const { searchParams } = new URL(request.url);

    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") || "20", 10) || 20
      )
    );

    const filter = {
      reporterId: user._id,
    };

    const [reports, total] = await Promise.all([
      Report.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate({
          path: "internshipId",
          model: Internship,
          select: "title category companyId location",
          populate: {
            path: "companyId",
            model: Company,
            select: "name website industry",
          },
        })
        .populate({
          path: "companyId",
          model: Company,
          select: "name website industry",
        })
        .lean(),

      Report.countDocuments(filter),
    ]);

    const data = reports.map(serializeReport);

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPreviousPage: page > 1,
      },
      count: data.length,
    });
  } catch (error) {
    console.error("Fetch student reports error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to fetch reports.",
      },
      { status: 500 }
    );
  }
}

// POST: Submit a new safety report.
export async function POST(request) {
  try {
    const { user, response } = await getStudent();

    if (response) return response;

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid request body.",
        },
        { status: 400 }
      );
    }

    const {
      category,
      internshipId,
      companyId,
      description,
      evidence = [],
    } = body || {};

    // Validate report category.
    if (!VALID_CATEGORIES.includes(category)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid report category.",
        },
        { status: 400 }
      );
    }

    // Validate description.
    if (
      typeof description !== "string" ||
      description.trim().length < 20 ||
      description.trim().length > 5000
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must contain between 20 and 5000 characters.",
        },
        { status: 400 }
      );
    }

    // Validate optional references.
    if (
      internshipId &&
      !mongoose.isValidObjectId(internshipId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid internship ID.",
        },
        { status: 400 }
      );
    }

    if (
      companyId &&
      !mongoose.isValidObjectId(companyId)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid company ID.",
        },
        { status: 400 }
      );
    }

    // Validate evidence array.
    if (!Array.isArray(evidence) || evidence.length > 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Evidence must be an array containing at most 10 items.",
        },
        { status: 400 }
      );
    }

    const cleanedEvidence = [];

    for (const item of evidence) {
      if (!item || typeof item !== "object") {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid evidence item.",
          },
          { status: 400 }
        );
      }

      const type = item.type || "other";

      if (!VALID_EVIDENCE_TYPES.includes(type)) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid evidence type.",
          },
          { status: 400 }
        );
      }

      const sourceUrl =
        typeof item.sourceUrl === "string"
          ? item.sourceUrl.trim()
          : "";

      const evidenceDescription =
        typeof item.description === "string"
          ? item.description.trim()
          : "";

      if (sourceUrl) {
        try {
          const parsedUrl = new URL(sourceUrl);

          if (!["http:", "https:"].includes(parsedUrl.protocol)) {
            throw new Error("Invalid protocol");
          }
        } catch {
          return NextResponse.json(
            {
              success: false,
              message: "Evidence URLs must be valid HTTP or HTTPS links.",
            },
            { status: 400 }
          );
        }
      }

      if (
        sourceUrl.length > 2000 ||
        evidenceDescription.length > 2000
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "Evidence fields exceed the allowed length.",
          },
          { status: 400 }
        );
      }

      cleanedEvidence.push({
        type,
        sourceUrl: sourceUrl || undefined,
        description: evidenceDescription || undefined,
      });
    }

    await connectDB();

    let relatedInternship = null;
    let relatedCompanyId = companyId || null;

    // Verify the internship exists and derive its company.
    if (internshipId) {
      relatedInternship = await Internship.findById(internshipId)
        .select("_id companyId title")
        .lean();

      if (!relatedInternship) {
        return NextResponse.json(
          {
            success: false,
            message: "The selected internship could not be found.",
          },
          { status: 404 }
        );
      }

      if (
        companyId &&
        String(companyId) !== String(relatedInternship.companyId)
      ) {
        return NextResponse.json(
          {
            success: false,
            message: "The selected company does not match the internship.",
          },
          { status: 400 }
        );
      }

      relatedCompanyId = relatedInternship.companyId;
    }

    // Verify a separately selected company exists.
    if (relatedCompanyId) {
      const companyExists = await Company.exists({
        _id: relatedCompanyId,
      });

      if (!companyExists) {
        return NextResponse.json(
          {
            success: false,
            message: "The selected company could not be found.",
          },
          { status: 404 }
        );
      }
    }

    const report = await Report.create({
      reporterId: user._id,
      internshipId: relatedInternship?._id || null,
      companyId: relatedCompanyId || null,
      category,
      description: description.trim(),
      evidence: cleanedEvidence,
      moderationStatus: "pending",
    });

    const populatedReport = await Report.findById(report._id)
      .populate({
        path: "internshipId",
        model: Internship,
        select: "title category companyId location",
        populate: {
          path: "companyId",
          model: Company,
          select: "name website industry",
        },
      })
      .populate({
        path: "companyId",
        model: Company,
        select: "name website industry",
      })
      .lean();

    return NextResponse.json(
      {
        success: true,
        message: "Report submitted successfully.",
        data: serializeReport(populatedReport),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student report error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Unable to submit your report.",
      },
      { status: 500 }
    );
  }
}

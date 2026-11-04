
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import RiskAssessment from "@/models/RiskAssessment";
import VerificationRecord from "@/models/VerificationRecord";

export async function GET(request, { params }) {
    try {
        const { internshipId } = await params;

        if (!mongoose.isValidObjectId(internshipId)) {
            return NextResponse.json({
                success: false,
                message: "Invalid internship ID.",
            }, { status: 400 });
        }

        await connectDB();

        const assessment = await RiskAssessment.findOne({
            internshipId,
            status: { $ne: "superseded" },
        }).sort({ assessedAt: -1 });

        if (!assessment) {
            return NextResponse.json({
                success: false,
                message: "No risk assessment found for this internship.",
            }, { status: 404 });
        }

        const verificationIds = assessment.evidenceRefs
            .filter((ref) => ref.sourceType === "verification")
            .map((ref) => ref.sourceId);

        const verificationRecords = await VerificationRecord.find({
            _id: { $in: verificationIds },
            internshipId,
        }).sort({ createdAt: -1 });

        return NextResponse.json({
            success: true,
            data: {
                assessment,
                verificationRecords,
            },
        }, { status: 200 });

    } catch (error) {
        console.error("Fetch Assessment Error:", error);

        return NextResponse.json({
            success: false,
            message: "Unable to retrieve risk assessment.",
        }, { status: 500 });
    }
}

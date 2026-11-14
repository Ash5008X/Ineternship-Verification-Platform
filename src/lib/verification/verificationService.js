
import mongoose from "mongoose";

import { connectDB } from "../../config/db.js";

import Internship from "../../models/Internship.js";
import Company from "../../models/Company.js";
import VerificationRecord from "../../models/VerificationRecord.js";
import RiskAssessment from "../../models/RiskAssessment.js";

import { runCompanyChecks } from "./companyChecks.js";
import { calculateRisk } from "./riskEngine.js";


export async function assessInternship(
    internshipId,
    {
        assessedBy = null,
        signals = {},
    } = {}
) {
    // 1. Validate internship ID
    if (
        typeof internshipId !== "string" ||
        !/^[a-fA-F0-9]{24}$/.test(internshipId.trim())
    ) {
        throw new Error("Invalid internship ID.");
    }

    // 2. Connect to MongoDB
    await connectDB();

    // 3. Fetch internship
    const internship = await Internship.findById(internshipId);

    if (!internship) {
        throw new Error("Internship not found.");
    }

    // 4. Fetch associated company
    const company = await Company.findById(internship.companyId);

    if (!company) {
        throw new Error("Associated company not found.");
    }

    // 5. Run company verification checks
    const companyChecks = await runCompanyChecks(company);

    // 6. Determine whether manual review is required
    const requiresManualReview =
        companyChecks.some(
            (check) =>
                check.status === "inconclusive" ||
                check.status === "failed"
        ) ||
        signals.requiresManualReview === true;

    // 7. Calculate overall risk
    const riskResult = calculateRisk({
        internship,
        company,
        signals: {
            ...signals,
            requiresManualReview,
        },
    });

    // 8. Start MongoDB transaction
    const session = await mongoose.startSession();

    let verificationRecords = [];
    let riskAssessment;

    try {
        await session.withTransaction(async () => {
            // Save verification records
            verificationRecords = await VerificationRecord.insertMany(
                companyChecks.map((check) => ({
                    internshipId: internship._id,
                    companyId: company._id,
                    checkType: check.checkType,
                    status: check.status,
                    method: "automated",
                    evidence: check.evidence,
                    notes: check.notes,
                    checkedAt: check.checkedAt,
                    reviewerId: null,
                })),
                { session }
            );

            // Create evidence references
            const evidenceRefs = verificationRecords.map((record) => ({
                sourceType: "verification",
                sourceId: record._id,
            }));

            // Create risk assessment
            [riskAssessment] = await RiskAssessment.create(
                [{
                    internshipId: internship._id,
                    companyId: company._id,
                    score: riskResult.score,
                    severity: riskResult.severity,
                    decision: riskResult.decision,
                    triggeredRules: riskResult.triggeredRules,
                    reasons: riskResult.reasons,
                    evidenceRefs,
                    status: riskResult.status,
                    ruleSetVersion: riskResult.ruleSetVersion,
                    assessedBy,
                    assessedAt: new Date(),
                }],
                { session }
            );

            // Supersede previous assessments
            await RiskAssessment.updateMany(
                {
                    internshipId: internship._id,
                    _id: { $ne: riskAssessment._id },
                    status: {
                        $in: ["completed", "needs_review"],
                    },
                },
                {
                    $set: {
                        status: "superseded",
                    },
                },
                { session }
            );
        });

    } finally {
        await session.endSession();
    }

    // 9. Return complete assessment result
    return {
        internshipId: internship._id,
        companyId: company._id,

        assessment: {
            id: riskAssessment._id,
            score: riskAssessment.score,
            severity: riskAssessment.severity,
            decision: riskAssessment.decision,
            status: riskAssessment.status,
            reasons: riskAssessment.reasons,
            triggeredRules: riskAssessment.triggeredRules,
            ruleSetVersion: riskAssessment.ruleSetVersion,
            assessedAt: riskAssessment.assessedAt,
        },

        verificationChecks: verificationRecords.map((record) => ({
            id: record._id,
            checkType: record.checkType,
            status: record.status,
            method: record.method,
            notes: record.notes,
            evidence: record.evidence,
            checkedAt: record.checkedAt,
        })),
    };
}

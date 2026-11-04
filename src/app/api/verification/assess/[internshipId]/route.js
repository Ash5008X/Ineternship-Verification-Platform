
import { NextResponse } from "next/server";
import { assessInternship } from "@/lib/verification/verificationService";

export async function POST(request, { params }) {
    try {
        const { internshipId } = await params;

        let body = {};

        try {
            body = await request.json();
        } catch {
            // Empty request body is allowed.
        }

        const result = await assessInternship(internshipId, {
            signals: {
                applicationFeeRequired:
                    body.applicationFeeRequired === true,

                upfrontPaymentRequired:
                    body.upfrontPaymentRequired === true,

                requiresManualReview:
                    body.requiresManualReview === true,
            },
        });

        return NextResponse.json({
            success: true,
            message: "Internship assessment completed.",
            data: result,
        }, { status: 200 });

    } catch (error) {
        console.error("Assessment API Error:", error);

        const status =
            error.message === "Invalid internship ID."
                ? 400
                : error.message === "Internship not found." ||
                  error.message === "Associated company not found."
                    ? 404
                    : 500;

        return NextResponse.json({
            success: false,
            message: error.message || "Assessment failed.",
        }, { status });
    }
}

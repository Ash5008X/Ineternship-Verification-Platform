import { NextResponse } from "next/server";
import { assessInternship } from "@/lib/verification/verificationService";

export async function POST(request, { params }) {
    try {
        const { internshipId } = await params;

        const result = await assessInternship(internshipId);

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
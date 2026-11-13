
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

export async function POST(request, { params }) {
    try {
        const { internshipId } = await params;

        if (!mongoose.isValidObjectId(internshipId)) {
            return NextResponse.json(
                { success: false, message: "Invalid internship ID." },
                { status: 400 }
            );
        }

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
                { success: false, message: "No company is associated with this recruiter." },
                { status: 404 }
            );
        }

        const internship = await Internship.findOne({
            _id: internshipId,
            companyId: company._id,
            createdBy: user._id,
        });

        if (!internship) {
            return NextResponse.json(
                { success: false, message: "Internship not found." },
                { status: 404 }
            );
        }

        if (internship.status !== "draft") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only draft internships can be submitted.",
                },
                { status: 409 }
            );
        }

        if (
            !internship.title?.trim() ||
            !internship.description?.trim() ||
            !internship.category?.trim()
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Complete the internship title, description, and category before submitting.",
                },
                { status: 400 }
            );
        }

        if (
            internship.applicationMethod === "external" &&
            !internship.applicationUrl
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Add an application URL before submitting.",
                },
                { status: 400 }
            );
        }

        if (
            internship.applicationMethod === "internal" &&
            internship.applicationUrl
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Remove the application URL before submitting an internal application.",
                },
                { status: 400 }
            );
        }

        internship.status = "pending";
        await internship.save();

        return NextResponse.json(
            {
                success: true,
                message: "Internship submitted for automated assessment.",
                data: internship,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Submit Internship Error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to submit internship." },
            { status: 500 }
        );
    }
}

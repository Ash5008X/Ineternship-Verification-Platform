
import { NextResponse } from "next/server";
import mongoose from "mongoose";

import { connectDB } from "@/config/db";
import Internship from "@/models/Internship";
import { requireRecruiter } from "@/lib/auth/requireRecruiter";
import { getRecruiterCompany } from "@/lib/auth/getRecruiterCompany";

export async function PATCH(request, { params }) {
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

        if (!["pending", "active"].includes(internship.status)) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Only pending or active internships can be withdrawn.",
                },
                { status: 409 }
            );
        }

        internship.status = "withdrawn";
        await internship.save();

        return NextResponse.json(
            {
                success: true,
                message: "Internship withdrawn successfully.",
                data: internship,
            },
            { status: 200 }
        );

    } catch (error) {
        console.error("Withdraw Internship Error:", error);

        return NextResponse.json(
            { success: false, message: "Unable to withdraw internship." },
            { status: 500 }
        );
    }
}

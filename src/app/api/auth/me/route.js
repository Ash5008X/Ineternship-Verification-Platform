
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
    const user = await getCurrentUser();

    if (!user) {
        return NextResponse.json(
            {
                success: false,
                authenticated: false,
                user: null,
            },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        authenticated: true,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatarUrl: user.avatarUrl,
            profile: user.profile,
            recruiterProfile: user.recruiterProfile,
        },
    });
}

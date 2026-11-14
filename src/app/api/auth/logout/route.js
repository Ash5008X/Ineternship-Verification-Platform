
import { NextResponse } from "next/server";
import { getAuthCookieOptions } from "@/lib/auth/auth";

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully.",
    });

    response.cookies.set("interncheck_token", "", {
        ...getAuthCookieOptions(),
        maxAge: 0,
        expires: new Date(0),
    });

    return response;
}


/* 
 * Handle the logout process.

async function handleLogout() {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "POST",
        });

        if (!response.ok) {
            throw new Error("Logout failed.");
        }

        window.location.href = "/login";
    } catch (error) {
        console.error(error);
    }
}
*/
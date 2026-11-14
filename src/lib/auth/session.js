
import { cookies } from "next/headers";
import { connectDB } from "@/config/db";
import User from "@/models/User";
import { verifyAuthToken } from "@/lib/auth/auth";

export async function getCurrentUser() {
    const cookieStore = await cookies();
    const token = cookieStore.get("interncheck_token")?.value;

    if (!token) return null;

    const payload = verifyAuthToken(token);

    if (!payload?.sub) return null;

    await connectDB();

    const user = await User.findById(payload.sub)
        .select("-passwordHash")
        .lean();

    if (!user || user.status !== "active") {
        return null;
    }

    if (user.role !== payload.role) {
        return null;
    }

    return user;
}

export async function requireRole(allowedRoles = []) {
    if (!Array.isArray(allowedRoles)) {
        throw new TypeError("allowedRoles must be an array.");
    }

    let user;

    try {
        user = await getCurrentUser();
    } catch (error) {
        console.error("Authentication session error:", error);

        return {
            authorized: false,
            status: 500,
            user: null,
        };
    }

    if (!user) {
        return {
            authorized: false,
            status: 401,
            user: null,
        };
    }

    if (
        allowedRoles.length > 0 &&
        !allowedRoles.includes(user.role)
    ) {
        return {
            authorized: false,
            status: 403,
            user: null,
        };
    }

    return {
        authorized: true,
        status: 200,
        user,
    };
}

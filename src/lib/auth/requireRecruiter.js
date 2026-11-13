
import { requireRole } from "@/lib/auth/session";

export async function requireRecruiter() {
    const result = await requireRole(["recruiter"]);

    if (!result.authorized) {
        return {
            user: null,
            error: {
                status: result.status,
                message:
                    result.status === 401
                        ? "Authentication required."
                        : result.status === 403
                            ? "Recruiter access required."
                            : "Unable to verify authentication.",
            },
        };
    }

    return {
        user: result.user,
        error: null,
    };
}

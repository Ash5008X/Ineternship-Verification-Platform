
import { getCurrentUser as getAuthUser } from "@/lib/auth/session";

export async function getCurrentUser() {
    return await getAuthUser();
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";

export default async function RecruiterLayout({ children }) {
    const user = await getCurrentUser();

    if (!user) {
        redirect("/login");
    }

    if (user.role !== "recruiter") {
        redirect("/home");
    }

    return children;
}
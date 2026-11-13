
import Company from "@/models/Company";

export async function getRecruiterCompany(userId) {
    const company = await Company.findOne({
        createdBy: userId,
    }).lean();

    return company ?? null;
}

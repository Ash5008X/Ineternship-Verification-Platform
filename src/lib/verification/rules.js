
export const RULE_SET_VERSION = "1.0.0";

export const RISK_THRESHOLDS = {
    LOW: {
        min: 0,
        max: 19,
        severity: "low",
    },
    MEDIUM: {
        min: 20,
        max: 44,
        severity: "medium",
    },
    HIGH: {
        min: 45,
        max: 69,
        severity: "high",
    },
    CRITICAL: {
        min: 70,
        max: 100,
        severity: "critical",
    },
};

export const RISK_RULES = {
    APPLICATION_FEE: {
        id: "APPLICATION_FEE",
        description: "The internship requires an application or registration fee.",
        weight: 35,
    },

    UPFRONT_PAYMENT: {
        id: "UPFRONT_PAYMENT",
        description: "The applicant is asked to make an upfront payment.",
        weight: 35,
    },

    PERSONAL_EMAIL: {
        id: "PERSONAL_EMAIL",
        description: "The recruiter uses a personal email instead of a company email.",
        weight: 10,
    },

    NO_COMPANY_WEBSITE: {
        id: "NO_COMPANY_WEBSITE",
        description: "No company website has been provided.",
        weight: 8,
    },

    WEBSITE_DOMAIN_MISMATCH: {
        id: "WEBSITE_DOMAIN_MISMATCH",
        description: "The recruiter email domain does not match the company website domain.",
        weight: 20,
    },

    VAGUE_DESCRIPTION: {
        id: "VAGUE_DESCRIPTION",
        description: "The internship description contains insufficient job details.",
        weight: 8,
    },

    UNREALISTIC_STIPEND: {
        id: "UNREALISTIC_STIPEND",
        description: "The advertised stipend appears unusually high for the listed role.",
        weight: 12,
    },

    MISSING_COMPANY_DETAILS: {
        id: "MISSING_COMPANY_DETAILS",
        description: "Important company information is missing.",
        weight: 8,
    },

    SUSPICIOUS_APPLICATION_URL: {
        id: "SUSPICIOUS_APPLICATION_URL",
        description: "The application URL has characteristics that require further review.",
        weight: 12,
    },

    INCOMPLETE_LISTING: {
        id: "INCOMPLETE_LISTING",
        description: "Important internship information is missing.",
        weight: 5,
    },
};

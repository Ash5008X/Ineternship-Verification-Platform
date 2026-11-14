
import {
    RISK_RULES,
    RISK_THRESHOLDS,
    RULE_SET_VERSION,
} from "./rules";

const normalizeDomain = (value) => {
    if (!value) return null;

    try {
        const url = value.includes("://")
            ? value
            : `https://${value}`;

        return new URL(url).hostname
            .toLowerCase()
            .replace(/^www\./, "");
    } catch {
        return null;
    }
};

const getEmailDomain = (email) => {
    if (!email || !email.includes("@")) return null;

    return email.split("@").pop().toLowerCase().trim();
};

const isPersonalEmail = (email) => {
    const personalDomains = [
        "gmail.com",
        "yahoo.com",
        "outlook.com",
        "hotmail.com",
        "rediffmail.com",
        "icloud.com",
        "proton.me",
        "protonmail.com",
    ];

    return personalDomains.includes(getEmailDomain(email));
};

const hasPaymentRequest = (text) => {
    const paymentPattern =
        /\b(registration fee|application fee|processing fee|training fee|security deposit|pay to apply|payment required|upfront payment)\b/i;

    return paymentPattern.test(text || "");
};

const isVagueDescription = (description) => {
    if (!description || description.trim().length < 120) {
        return true;
    }

    const vaguePatterns = [
        /earn money from home/i,
        /no skills required/i,
        /guaranteed income/i,
        /easy work/i,
        /limited seats apply now/i,
    ];

    return vaguePatterns.some((pattern) =>
        pattern.test(description)
    );
};

const isSuspiciousApplicationUrl = (value) => {
    if (!value) return false;

    try {
        const url = new URL(value);
        const hostname = url.hostname.toLowerCase();

        const shorteners = [
            "bit.ly",
            "tinyurl.com",
            "t.co",
            "cutt.ly",
            "rb.gy",
        ];

        const isShortened = shorteners.some(
            (domain) =>
                hostname === domain ||
                hostname.endsWith(`.${domain}`)
        );

        const isIpAddress =
            /^\d{1,3}(\.\d{1,3}){3}$/.test(hostname);

        return (
            url.protocol !== "https:" ||
            isShortened ||
            isIpAddress
        );
    } catch {
        return true;
    }
};

const getSeverity = (score) => {
    for (const threshold of Object.values(RISK_THRESHOLDS)) {
        if (
            score >= threshold.min &&
            score <= threshold.max
        ) {
            return threshold.severity;
        }
    }

    return "critical";
};
const getDecision = (score, triggeredRules, requiresManualReview) => {
    const hardStopRules = [
        "APPLICATION_FEE",
        "UPFRONT_PAYMENT",
    ];

    const hasHardStop = triggeredRules.some((rule) =>
        hardStopRules.includes(rule.ruleId)
    );

    if (hasHardStop) {
        return "rejected";
    }

    if (score >= 20 || requiresManualReview) {
        return "needs_review";
    }

    return "approved";
};
export function calculateRisk({
    internship,
    company,
    signals = {},
}) {
    if (!internship || !company) {
        throw new Error(
            "Both internship and company data are required."
        );
    }

    const triggeredRules = [];

    const triggerRule = (rule, observed) => {
        triggeredRules.push({
            ruleId: rule.id,
            description: rule.description,
            weight: rule.weight,
            observed: String(observed).slice(0, 1000),
        });
    };

    const description = internship.description || "";
    const applicationUrl = internship.applicationUrl;
    const companyWebsite = company.website;
    const contactEmail = company.contactEmail;

    // 1. Application fee detection
    const feeDetected =
        signals.applicationFeeRequired === true ||
        hasPaymentRequest(description);

    if (feeDetected) {
        triggerRule(
            RISK_RULES.APPLICATION_FEE,
            "Application or registration fee detected."
        );
    }

    // 2. Upfront payment detection
    if (signals.upfrontPaymentRequired === true) {
        triggerRule(
            RISK_RULES.UPFRONT_PAYMENT,
            "Upfront payment requirement reported."
        );
    }

    // 3. Personal recruiter email
    if (contactEmail && isPersonalEmail(contactEmail)) {
        triggerRule(
            RISK_RULES.PERSONAL_EMAIL,
            `Recruiter email: ${contactEmail}`
        );
    }

    // 4. Missing company website
    if (!companyWebsite) {
        triggerRule(
            RISK_RULES.NO_COMPANY_WEBSITE,
            "Company website was not provided."
        );
    }

    // 5. Website and email domain mismatch
    const websiteDomain = normalizeDomain(companyWebsite);
    const emailDomain = getEmailDomain(contactEmail);

    if (
        websiteDomain &&
        emailDomain &&
        !isPersonalEmail(contactEmail) &&
        websiteDomain !== emailDomain &&
        !websiteDomain.endsWith(`.${emailDomain}`) &&
        !emailDomain.endsWith(`.${websiteDomain}`)
    ) {
        triggerRule(
            RISK_RULES.WEBSITE_DOMAIN_MISMATCH,
            `Website domain: ${websiteDomain}, email domain: ${emailDomain}`
        );
    }

    // 6. Vague internship description
    if (isVagueDescription(description)) {
        triggerRule(
            RISK_RULES.VAGUE_DESCRIPTION,
            "Internship description is too short or contains vague claims."
        );
    }

    // 7. Unrealistic stipend
    const stipend = internship.stipend || {};

    if (
        stipend.amount >= 100000 &&
        stipend.currency === "INR" &&
        stipend.period === "monthly"
    ) {
        triggerRule(
            RISK_RULES.UNREALISTIC_STIPEND,
            `Advertised stipend: ${stipend.amount} INR per month. Requires review.`
        );
    }

    // 8. Missing company information
    if (!company.name || !company.normalizedName) {
        triggerRule(
            RISK_RULES.MISSING_COMPANY_DETAILS,
            "Company name or normalized name is missing."
        );
    }

    // 9. Suspicious application URL
    if (isSuspiciousApplicationUrl(applicationUrl)) {
        triggerRule(
            RISK_RULES.SUSPICIOUS_APPLICATION_URL,
            `Application URL requires review: ${applicationUrl}`
        );
    }

    // 10. Incomplete internship listing
    const missingFields = [];

    if (!internship.title) missingFields.push("title");
    if (!internship.category) missingFields.push("category");
    if (!description) missingFields.push("description");
    if (!internship.duration?.value) missingFields.push("duration");
    if (!internship.workMode ||
        internship.workMode === "unspecified") {
        missingFields.push("work mode");
    }

    if (missingFields.length > 0) {
        triggerRule(
            RISK_RULES.INCOMPLETE_LISTING,
            `Missing information: ${missingFields.join(", ")}`
        );
    }

    // Calculate total risk score
    const rawScore = triggeredRules.reduce(
        (total, rule) => total + rule.weight,
        0
    );

    const score = Math.min(rawScore, 100);
    const severity = getSeverity(score);


    const decision = getDecision(
        score,
        triggeredRules,
        signals.requiresManualReview === true
    );

    const reasons = triggeredRules.map(
        (rule) => rule.description
    );

    return {
    score,
    severity,
    decision,
    triggeredRules,
    reasons,
    status: signals.requiresManualReview
        ? "needs_review"
        : "completed",
    ruleSetVersion: RULE_SET_VERSION,
};
}

import dns from "node:dns/promises";
import net from "node:net";

const normalizeDomain = (value) => {
    if (!value) return null;

    try {
        const url = new URL(
            value.includes("://") ? value : `https://${value}`
        );

        return url.hostname
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

const isValidEmail = (email) => {
    if (!email) return false;

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

const isValidWebsite = (website) => {
    if (!website) return false;

    try {
        const url = new URL(
            website.includes("://")
                ? website
                : `https://${website}`
        );

        return (
            ["http:", "https:"].includes(url.protocol) &&
            Boolean(url.hostname.includes(".")) &&
            !url.username &&
            !url.password
        );
    } catch {
        return false;
    }
};

const isPrivateIP = (ip) => {
    if (net.isIPv4(ip)) {
        const [a, b] = ip.split(".").map(Number);

        return (
            a === 10 ||
            a === 127 ||
            a === 0 ||
            (a === 172 && b >= 16 && b <= 31) ||
            (a === 192 && b === 168) ||
            (a === 169 && b === 254) ||
            a >= 224
        );
    }

    if (net.isIPv6(ip)) {
        const address = ip.toLowerCase();

        return (
            address === "::1" ||
            address === "::" ||
            address.startsWith("fc") ||
            address.startsWith("fd") ||
            address.startsWith("fe80:") ||
            address.startsWith("::ffff:127.")
        );
    }

    return true;
};

const resolvePublicDomain = async (hostname) => {
    const addresses = await dns.lookup(hostname, {
        all: true,
        verbatim: true,
    });

    if (!addresses.length) {
        return false;
    }

    return addresses.every(({ address }) => !isPrivateIP(address));
};

const createCheck = ({
    checkType,
    status,
    notes,
    evidence = [],
}) => ({
    checkType,
    status,
    method: "automated",
    notes,
    evidence,
    checkedAt: new Date(),
});

// 1. Company identity check
export function checkCompanyIdentity(company) {
    if (!company) {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Company information is unavailable.",
        });
    }

    if (company.identityStatus === "rejected") {
        return createCheck({
            checkType: "company_identity",
            status: "failed",
            notes: "Company identity has previously been rejected.",
        });
    }

    const registration = company.registrationDetails;

    if (
        !registration?.registrationNumber ||
        !registration?.jurisdiction
    ) {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Company registration details are incomplete.",
        });
    }

    if (company.identityStatus !== "verified") {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Company identity has not been independently verified.",
        });
    }

    if (!registration.sourceUrl || !registration.checkedAt) {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Verified status exists, but supporting verification evidence or its timestamp is missing.",
        });
    }

    const checkedAt = new Date(registration.checkedAt);

    if (
        Number.isNaN(checkedAt.getTime()) ||
        checkedAt > new Date()
    ) {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Company verification timestamp is invalid.",
        });
    }

    const ageInDays =
        (Date.now() - checkedAt.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > 180) {
        return createCheck({
            checkType: "company_identity",
            status: "inconclusive",
            notes: "Company verification is older than 180 days and requires renewal.",
        });
    }

    return createCheck({
        checkType: "company_identity",
        status: "passed",
        notes: "Company has a verified identity with supporting registration evidence within the last 180 days.",
        evidence: [{
            type: "url",
            sourceUrl: registration.sourceUrl,
            description: `Registration number: ${registration.registrationNumber}; jurisdiction: ${registration.jurisdiction}; last verified: ${checkedAt.toISOString()}.`,
            capturedAt: checkedAt,
        }],
    });
}

// 2. Company website check
export async function checkCompanyWebsite(company) {
    if (!company?.website) {
        return createCheck({
            checkType: "website",
            status: "inconclusive",
            notes: "Company website has not been provided.",
        });
    }

    if (!isValidWebsite(company.website)) {
        return createCheck({
            checkType: "website",
            status: "failed",
            notes: "Company website URL has an invalid format.",
        });
    }

    let url;

    try {
        url = new URL(
            company.website.includes("://")
                ? company.website
                : `https://${company.website}`
        );

        if (url.protocol !== "https:") {
            return createCheck({
                checkType: "website",
                status: "inconclusive",
                notes: "Website does not use HTTPS.",
            });
        }

        if (url.hostname === "localhost" || url.hostname.endsWith(".localhost")) {
            throw new Error("Localhost is not allowed.");
        }

        const isPublic = await resolvePublicDomain(url.hostname);

        if (!isPublic) {
            throw new Error("Website resolves to a private or restricted IP address.");
        }

    } catch (error) {
        return createCheck({
            checkType: "website",
            status: "failed",
            notes: `Website DNS or security check failed: ${error.message}`,
        });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
        const response = await fetch(url, {
            method: "HEAD",
            redirect: "error",
            signal: controller.signal,
        });

        return createCheck({
            checkType: "website",
            status: response.ok ? "inconclusive" : "inconclusive",
            notes: `Website is reachable and returned HTTP ${response.status}. Website ownership and legitimacy remain unverified.`,
            evidence: [{
                type: "url",
                sourceUrl: url.href,
                description: `Website responded with HTTP ${response.status}.`,
            }],
        });

    } catch (error) {
        return createCheck({
            checkType: "website",
            status: "inconclusive",
            notes: error.name === "AbortError"
                ? "Website request timed out."
                : `Website could not be reached: ${error.message}`,
            evidence: [{
                type: "url",
                sourceUrl: url.href,
                description: "Website availability check attempted.",
            }],
        });

    } finally {
        clearTimeout(timeout);
    }
}

// 3. Contact details check
export async function checkContactDetails(company) {
    if (!company?.contactEmail) {
        return createCheck({
            checkType: "contact_details",
            status: "inconclusive",
            notes: "Company contact email has not been provided.",
        });
    }

    if (!isValidEmail(company.contactEmail)) {
        return createCheck({
            checkType: "contact_details",
            status: "failed",
            notes: "Company contact email has an invalid format.",
        });
    }

    const emailDomain = getEmailDomain(company.contactEmail);
    const websiteDomain = normalizeDomain(company.website);

    if (!websiteDomain) {
        return createCheck({
            checkType: "contact_details",
            status: "inconclusive",
            notes: "Email format is valid, but no valid company website is available for comparison.",
        });
    }

    if (
        emailDomain !== websiteDomain &&
        !websiteDomain.endsWith(`.${emailDomain}`) &&
        !emailDomain.endsWith(`.${websiteDomain}`)
    ) {
        return createCheck({
            checkType: "contact_details",
            status: "inconclusive",
            notes: "Contact email domain differs from the company website domain. Further review is required.",
        });
    }

    try {
        const records = await dns.resolveMx(emailDomain);

        if (!records.length) {
            return createCheck({
                checkType: "contact_details",
                status: "inconclusive",
                notes: "Email domain has no MX records. Email delivery capability could not be established.",
            });
        }

        return createCheck({
            checkType: "contact_details",
            status: "inconclusive",
            notes: "Email and website domains are consistent, and the email domain has MX records. Actual email ownership remains unverified.",
        });

    } catch {
        return createCheck({
            checkType: "contact_details",
            status: "inconclusive",
            notes: "Could not verify email domain DNS records.",
        });
    }
}

// 4. Company registration check
export async function checkCompanyRegistration(company) {
    const registration = company?.registrationDetails;

    if (!registration?.registrationNumber) {
        return createCheck({
            checkType: "other",
            status: "inconclusive",
            notes: "Company registration number is unavailable.",
        });
    }

    if (!registration.jurisdiction) {
        return createCheck({
            checkType: "other",
            status: "inconclusive",
            notes: "Company registration jurisdiction is unavailable.",
        });
    }

    if (!registration.sourceUrl) {
        return createCheck({
            checkType: "other",
            status: "inconclusive",
            notes: "Registration details are available, but no verification source is recorded.",
        });
    }

    let sourceUrl;

    try {
        sourceUrl = new URL(registration.sourceUrl);

        if (
            sourceUrl.protocol !== "https:" ||
            sourceUrl.username ||
            sourceUrl.password
        ) {
            throw new Error("Invalid registration source URL.");
        }
    } catch {
        return createCheck({
            checkType: "other",
            status: "inconclusive",
            notes: "Registration source URL is invalid or does not use HTTPS.",
        });
    }

    return createCheck({
        checkType: "other",
        status: "inconclusive",
        notes: "Registration details and source URL are provided. Independent confirmation against an authoritative company registry is still required.",
        evidence: [{
            type: "url",
            sourceUrl: sourceUrl.href,
            description: `Registration number: ${registration.registrationNumber}; jurisdiction: ${registration.jurisdiction}.`,
        }],
    });
}

// Run all company checks
export async function runCompanyChecks(company) {
    return Promise.all([
        checkCompanyIdentity(company),
        checkCompanyWebsite(company),
        checkContactDetails(company),
        checkCompanyRegistration(company),
    ]);
}

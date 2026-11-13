import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is missing from environment variables.");
}

export function createAuthToken(user) {
    return jwt.sign(
        { sub: user._id.toString(), role: user.role },
        JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d",
            algorithm: "HS256",
        }
    );
}

export function verifyAuthToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] });
    } catch {
        return null;
    }
}

export function getAuthCookieOptions() {
    return {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
    };
}
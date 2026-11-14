
"use client";

import { useState } from "react";

export default function RecruiterRegisterForm({
    onToggle,
    onSwitchToStudent,
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const formData = new FormData(form);

        const password = formData.get("password");
        const confirmPassword = formData.get("confirmPassword");

        if (password !== confirmPassword) {
            setMessage("Your passwords do not match.");
            return;
        }

        if (password.length < 8) {
            setMessage("Your password must contain at least 8 characters.");
            return;
        }

        if (!formData.get("terms")) {
            setMessage("Please accept the terms and privacy policy.");
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch("/api/auth/register/recruiter", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    fullName: formData.get("fullName"),
                    workEmail: formData.get("workEmail"),
                    companyName: formData.get("companyName"),
                    companyWebsite: formData.get("companyWebsite"),
                    jobTitle: formData.get("jobTitle"),
                    password,
                }),
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || "Registration failed.");
            }

            setMessage("Recruiter account created. Redirecting...");

            window.location.href = "/recruiter/dashboard";
        } catch (error) {
            setMessage(error.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-form-panel">
            <div className="auth-form-content auth-form-content--register">
                <p className="auth-form-kicker">
                    RECRUITER REGISTRATION
                </p>

                <h2 className="auth-form-title">
                    Build trust with talent.
                </h2>

                <p className="auth-form-subtitle">
                    Create your recruiter account to share internship
                    opportunities with students.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span className="auth-label">Full name</span>
                        <input
                            className="auth-input"
                            type="text"
                            name="fullName"
                            placeholder="Your full name"
                            autoComplete="name"
                            minLength={2}
                            maxLength={80}
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">Work email</span>
                        <input
                            className="auth-input"
                            type="email"
                            name="workEmail"
                            placeholder="you@company.com"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">Company name</span>
                        <input
                            className="auth-input"
                            type="text"
                            name="companyName"
                            placeholder="Your company name"
                            autoComplete="organization"
                            maxLength={120}
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">
                            Company website
                            <span> (Optional)</span>
                        </span>
                        <input
                            className="auth-input"
                            type="url"
                            name="companyWebsite"
                            placeholder="https://company.com"
                            autoComplete="url"
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">Job title</span>
                        <input
                            className="auth-input"
                            type="text"
                            name="jobTitle"
                            placeholder="e.g. HR Manager"
                            autoComplete="organization-title"
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">Password</span>

                        <span className="auth-password-wrap">
                            <input
                                className="auth-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="At least 8 characters"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <button
                                className="auth-password-toggle"
                                type="button"
                                onClick={() =>
                                    setShowPassword((value) => !value)
                                }
                                aria-label={
                                    showPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </span>
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">
                            Confirm password
                        </span>

                        <span className="auth-password-wrap">
                            <input
                                className="auth-input"
                                type={
                                    showConfirmPassword
                                        ? "text"
                                        : "password"
                                }
                                name="confirmPassword"
                                placeholder="Enter your password again"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />

                            <button
                                className="auth-password-toggle"
                                type="button"
                                onClick={() =>
                                    setShowConfirmPassword(
                                        (value) => !value
                                    )
                                }
                                aria-label={
                                    showConfirmPassword
                                        ? "Hide password"
                                        : "Show password"
                                }
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </span>
                    </label>

                    <label className="auth-remember auth-terms">
                        <input
                            type="checkbox"
                            name="terms"
                            required
                        />
                        <span>
                            I agree to the terms and confirm that my
                            company and account details are accurate.
                        </span>
                    </label>

                    {message && (
                        <p className="auth-message" role="status">
                            {message}
                        </p>
                    )}

                    <button
                        className="auth-submit-btn"
                        type="submit"
                        disabled={loading}
                    >
                        <span>
                            {loading ? "Creating account..." : "Create recruiter account"}
                        </span>
                        <span className="auth-btn-arrow" aria-hidden="true">
                            ↗
                        </span>
                    </button>
                </form>

                <div className="auth-mobile-only">
                    <p>
                        Registering as a student?{" "}
                        <button
                            className="auth-toggle-btn"
                            type="button"
                            onClick={onSwitchToStudent}
                        >
                            Switch to student
                        </button>
                    </p>
                </div>

                <div className="auth-toggle-link">
                    <p>
                        Already have an account?{" "}
                        <button
                            className="auth-toggle-btn"
                            type="button"
                            onClick={onToggle}
                        >
                            Sign in
                        </button>
                    </p>
                </div>

                <p className="auth-legal-note">
                    Recruiter accounts may require company verification
                    before internship listings can be published.
                </p>
            </div>
        </div>
    );
}

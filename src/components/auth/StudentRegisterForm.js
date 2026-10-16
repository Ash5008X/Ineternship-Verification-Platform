
"use client";

import { useState } from "react";

export default function RegisterForm({ onToggle, onSwitchToRecruiter }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState("");

    const currentYear = new Date().getFullYear();
    const graduationYears = Array.from(
        { length: 8 },
        (_, index) => currentYear + index
    );

    function handleSubmit(event) {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
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

        setMessage("Registration API will be connected in the next step.");
    }

    return (
        <div className="auth-form-panel">
            <div className="auth-form-content auth-form-content--register">
                <p className="auth-form-kicker">YOUR JOURNEY STARTS HERE</p>
                <h2 className="auth-form-title">Join us.</h2>
                <p className="auth-form-subtitle">
                    Create your student account in a few simple steps.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span className="auth-label">Full name</span>
                        <input
                            className="auth-input"
                            type="text"
                            name="name"
                            placeholder="Your full name"
                            autoComplete="name"
                            minLength={2}
                            maxLength={80}
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">College email</span>
                        <input
                            className="auth-input"
                            type="email"
                            name="email"
                            placeholder="you@college.edu"
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">College / university</span>
                        <input
                            className="auth-input"
                            type="text"
                            name="college"
                            placeholder="Your institution"
                            autoComplete="organization"
                            maxLength={120}
                            required
                        />
                    </label>

                    <div className="auth-field-row">
                        <label className="auth-field">
                            <span className="auth-label">Degree</span>
                            <select className="auth-input auth-select" name="degree" required defaultValue="">
                                <option value="" disabled>
                                    Select degree
                                </option>
                                <option value="BTech">B.Tech</option>
                                <option value="BE">B.E.</option>
                                <option value="BSc">B.Sc.</option>
                                <option value="BCA">BCA</option>
                                <option value="MTech">M.Tech</option>
                                <option value="MSc">M.Sc.</option>
                                <option value="MCA">MCA</option>
                                <option value="Other">Other</option>
                            </select>
                        </label>

                        <label className="auth-field">
                            <span className="auth-label">Graduation year</span>
                            <select
                                className="auth-input auth-select"
                                name="graduationYear"
                                defaultValue=""
                                required
                            >
                                <option value="" disabled>
                                    Select year
                                </option>
                                {graduationYears.map((year) => (
                                    <option key={year} value={year}>
                                        {year}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>

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
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? "Hide" : "Show"}
                            </button>
                        </span>
                    </label>

                    <label className="auth-field">
                        <span className="auth-label">Confirm password</span>
                        <span className="auth-password-wrap">
                            <input
                                className="auth-input"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Enter your password again"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                            <button
                                className="auth-password-toggle"
                                type="button"
                                onClick={() => setShowConfirmPassword((value) => !value)}
                                aria-label={
                                    showConfirmPassword ? "Hide password" : "Show password"
                                }
                            >
                                {showConfirmPassword ? "Hide" : "Show"}
                            </button>
                        </span>
                    </label>

                    <label className="auth-remember auth-terms">
                        <input type="checkbox" name="terms" required />
                        <span>
                            I agree to the terms and understand that account details must be
                            accurate.
                        </span>
                    </label>

                    {message && (
                        <p className="auth-message" role="status">
                            {message}
                        </p>
                    )}

                    <button className="auth-submit-btn" type="submit">
                        <span>Create account</span>
                        <span className="auth-btn-arrow" aria-hidden="true">
                            ↗
                        </span>
                    </button>
                </form>

                <div className="auth-mobile-only">
                    <p>
                        Want to hire interns?{" "}
                        <button
                            className="auth-toggle-btn"
                            type="button"
                            onClick={onSwitchToRecruiter}
                        >
                            Register as a recruiter
                        </button>
                    </p>
                </div>

                <div className="auth-toggle-link">
                    <p>
                        Already have an account?{" "}
                        <button className="auth-toggle-btn" type="button" onClick={onToggle}>
                            Sign in
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
}

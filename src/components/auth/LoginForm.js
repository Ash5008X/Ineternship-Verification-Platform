
"use client";

import { useState } from "react";

export default function LoginForm({ onToggle }) {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);
    const [message, setMessage] = useState("");

    function handleSubmit(event) {
        event.preventDefault();
        setMessage("Login API will be connected in the next step.");
    }

    return (
        <div className="auth-form-panel">
            <div className="auth-form-content">
                <p className="auth-form-kicker">GOOD TO SEE YOU AGAIN</p>
                <h2 className="auth-form-title">Sign in.</h2>
                <p className="auth-form-subtitle">
                    Pick up where your internship journey left off.
                </p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <label className="auth-field">
                        <span className="auth-label">Email address</span>
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
                        <span className="auth-label">Password</span>
                        <span className="auth-password-wrap">
                            <input
                                className="auth-input"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Enter your password"
                                autoComplete="current-password"
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

                    <div className="auth-form-options">
                        <label className="auth-remember">
                            <input
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(event) => setRememberMe(event.target.checked)}
                            />
                            <span>Remember me</span>
                        </label>

                        <button
                            className="auth-text-link"
                            type="button"
                            onClick={() =>
                                setMessage("Password recovery will be added later.")
                            }
                        >
                            Forgot password?
                        </button>
                    </div>

                    {message && (
                        <p className="auth-message" role="status">
                            {message}
                        </p>
                    )}

                    <button className="auth-submit-btn" type="submit">
                        <span>Sign in</span>
                        <span className="auth-btn-arrow" aria-hidden="true">
                            ↗
                        </span>
                    </button>
                </form>

                <div className="auth-toggle-link">
                    <p>
                        New to InternCheck?{" "}
                        <button className="auth-toggle-btn" type="button" onClick={onToggle}>
                            Create an account
                        </button>
                    </p>
                </div>

                <p className="auth-legal-note">
                    By continuing, you agree to use InternCheck responsibly.
                </p>
            </div>
        </div>
    );
}

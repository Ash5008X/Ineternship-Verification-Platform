
export default function AuthHeader({
    isLogin,
    accountType,
    onRecruiterClick,
    onStudentClick,
}) {
    const isStudentRegistration = !isLogin && accountType === "student";

    const ctaLabel =
        isLogin || isStudentRegistration
            ? "Register as a recruiter"
            : "Register as a student";

    const ctaHeading =
        isLogin || isStudentRegistration
            ? "HIRING TALENT?"
            : "LOOKING FOR INTERNSHIPS?";

    const ctaDescription =
        isLogin || isStudentRegistration
            ? "Connect with students and post internship opportunities."
            : "Discover opportunities and learn from real student experiences.";

    const handleCtaClick = () => {
        if (isLogin || isStudentRegistration) {
            onRecruiterClick();
        } else {
            onStudentClick();
        }
    };

    return (
        <div className="auth-welcome-panel">
            <div className="auth-welcome-content">
                <div className="auth-brand">
                    <span className="auth-brand-mark">I</span>
                    <span>
                        Intern
                        <span className="auth-brand-highlight">Check</span>
                    </span>
                </div>

                <div className="auth-welcome-stagger auth-welcome-text">
                    <p className="auth-eyebrow">
                        {isLogin
                            ? "YOUR NEXT CHAPTER STARTS HERE"
                            : "MAKE YOUR FIRST MOVE"}
                    </p>

                    <h1 className="auth-welcome-heading">
                        {isLogin ? (
                            <>
                                Welcome
                                <br />
                                <span className="auth-welcome-highlight">
                                    back.
                                </span>
                            </>
                        ) : (
                            <>
                                Start with
                                <br />
                                <span className="auth-welcome-highlight">
                                    confidence.
                                </span>
                            </>
                        )}
                    </h1>

                    <p className="auth-welcome-desc">
                        {isLogin
                            ? "Find opportunities worth your time. Make smarter decisions about your internship journey."
                            : "Discover opportunities, check their credibility, and learn from students who have been there."}
                    </p>
                </div>

                <div className="auth-stats auth-welcome-stagger">
                    <div className="auth-stat-item">
                        <span className="auth-stat-icon">✓</span>

                        <div className="auth-stat-content">
                            <strong>Check before you commit</strong>
                            <span>
                                Make informed internship decisions.
                            </span>
                        </div>
                    </div>

                    <div className="auth-stat-item">
                        <span className="auth-stat-icon">↗</span>

                        <div className="auth-stat-content">
                            <strong>Learn from real experiences</strong>
                            <span>
                                Use student insights to guide your next step.
                            </span>
                        </div>
                    </div>
                </div>

                <div className="auth-welcome-footer">
                    <p>A little research can save a lot of regret.</p>

                    <div className="auth-recruiter-cta">
                        <span className="auth-recruiter-label">
                            {ctaHeading}
                        </span>

                        <button
                            type="button"
                            className="auth-recruiter-button"
                            onClick={handleCtaClick}
                        >
                            {ctaLabel}
                            <span aria-hidden="true">↗</span>
                        </button>

                        <span className="auth-recruiter-description">
                            {ctaDescription}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

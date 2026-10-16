
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import AuthHeader from "./AuthHeader";
import LoginForm from "./LoginForm";
import StudentRegister from "./StudentRegisterForm";
import RecruiterRegisterForm from "./RecruiterRegisterForm";

export default function Auth({ initialMode = "login" }) {
    const [isLogin, setIsLogin] = useState(initialMode === "login");
    const [accountType, setAccountType] = useState("student");
    const [transitionState, setTransitionState] = useState("idle");
    const [registerTransition, setRegisterTransition] = useState("idle");

    const timers = useRef([]);

    const clearTimers = useCallback(() => {
        timers.current.forEach((timer) => clearTimeout(timer));
        timers.current = [];
    }, []);

    const schedule = useCallback((callback, delay) => {
        const timer = setTimeout(callback, delay);
        timers.current.push(timer);
        return timer;
    }, []);

    useEffect(() => {
        return () => clearTimers();
    }, [clearTimers]);

    const toggleMode = useCallback(() => {
        if (transitionState !== "idle") return;

        clearTimers();
        setTransitionState("preparing");

        schedule(() => {
            setTransitionState("collapsing");

            schedule(() => {
                setIsLogin((previous) => !previous);
                setAccountType("student");
                setRegisterTransition("idle");
                setTransitionState("expanding");

                schedule(() => {
                    setTransitionState("idle");
                }, 450);
            }, 450);
        }, 120);
    }, [transitionState, clearTimers, schedule]);

    const switchAccountType = useCallback(
        (nextType) => {
            if (
                transitionState !== "idle" ||
                registerTransition !== "idle" ||
                isLogin ||
                accountType === nextType
            ) {
                return;
            }

            clearTimers();
            setRegisterTransition("collapsing");

            schedule(() => {
                setAccountType(nextType);
                setRegisterTransition("expanding");

                schedule(() => {
                    setRegisterTransition("idle");
                }, 300);
            }, 180);
        },
        [
            transitionState,
            registerTransition,
            isLogin,
            accountType,
            clearTimers,
            schedule,
        ]
    );

    const handleRecruiterClick = useCallback(() => {
        if (isLogin) {
            toggleMode();
            return;
        }

        switchAccountType("recruiter");
    }, [isLogin, toggleMode, switchAccountType]);

    const handleStudentClick = useCallback(() => {
        switchAccountType("student");
    }, [switchAccountType]);

    return (
        <div
            className={`auth-page ${isLogin ? "is-login" : "is-register"
                } is-${transitionState} ${registerTransition !== "idle"
                    ? `register-${registerTransition}`
                    : ""
                }`}
        >
            <div className="auth-bg">
                <div className="auth-bg-grid" />

                <div className="auth-bg-glow auth-bg-glow--1" />
                <div className="auth-bg-glow auth-bg-glow--2" />
                <div className="auth-bg-glow auth-bg-glow--3" />
                <div className="auth-bg-glow auth-bg-glow--4" />

                {Array.from({ length: 8 }, (_, index) => (
                    <div
                        key={`square-${index}`}
                        className={`auth-bg-square auth-bg-square--${index + 1}`}
                    />
                ))}

                {Array.from({ length: 4 }, (_, index) => (
                    <div
                        key={`line-${index}`}
                        className={`auth-bg-line auth-bg-line--${index + 1}`}
                    />
                ))}
            </div>

            <div
                className={`auth-card ${isLogin ? "auth-card--login" : "auth-card--register"
                    }`}
            >
                <div className="auth-accent-dots" aria-hidden="true">
                    {Array.from({ length: 6 }, (_, index) => (
                        <span
                            key={index}
                            className={`auth-accent-dot auth-accent-dot--${index + 1}`}
                        />
                    ))}
                </div>

                <div className="auth-panel auth-panel--forms">
                    <div
                        className={`auth-form-slide ${isLogin ? "active" : "inactive"
                            }`}
                    >
                        <LoginForm onToggle={toggleMode} />
                    </div>

                    <div
                        className={`auth-form-slide ${!isLogin ? "active" : "inactive"
                            }`}
                    >
                        {!isLogin && (
                            <div
                                key={accountType}
                                className={`auth-register-content ${registerTransition !== "idle"
                                    ? `register-fields-${registerTransition}`
                                    : ""
                                    }`}
                            >
                                {accountType === "student" ? (
                                    <StudentRegister
                                        onToggle={toggleMode}
                                        onSwitchToRecruiter={handleRecruiterClick}
                                    />
                                ) : (
                                    <RecruiterRegisterForm
                                        onToggle={toggleMode}
                                        onSwitchToStudent={handleStudentClick}
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="auth-panel auth-panel--welcome">
                    <AuthHeader
                        isLogin={isLogin}
                        accountType={accountType}
                        onRecruiterClick={handleRecruiterClick}
                        onStudentClick={handleStudentClick}
                    />
                </div>

                <div className="auth-divider" />
            </div>
        </div>
    );
}

// ============================================
// LOGIN PAGE COMPONENT
// ============================================

import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Simple validation check
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-layout">
            <div className="auth-brand-panel">
                <div className="auth-brand-content">
                    <div className="auth-brand-logo">
                        EduNex<span className="logo-dot">.</span>
                    </div>
                    <p className="auth-brand-tagline">
                        Your Premium Learning Experience
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Interactive course materials and assignments</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10"/>
                                    <line x1="12" y1="20" x2="12" y2="4"/>
                                    <line x1="6" y1="20" x2="6" y2="14"/>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Real-time progress tracking and analytics</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Collaborative forums and discussions</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h2>Welcome Back</h2>
                        <p>Sign in to continue learning</p>
                    </div>

                    {error && <div className="alert alert-danger animate-fade-in">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <div className="input-with-icon">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input"
                                    placeholder="john@school.edu"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label htmlFor="password">Password</label>
                            <div className="input-with-icon">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    className="input-suffix"
                                    onClick={() => setShowPassword(!showPassword)}
                                    title={showPassword ? "Hide password" : "Show password"}
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                                            <line x1="1" y1="1" x2="23" y2="23"/>
                                        </svg>
                                    ) : (
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                            <circle cx="12" cy="12" r="3"/>
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="btn btn-primary btn-lg" 
                            style={{ width: "100%" }}
                        >
                            {submitting ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                    <span>Signing in...</span>
                                </div>
                            ) : "Login"}
                        </button>
                    </form>

                    <div className="auth-form-footer" style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--primary-400)" }}>
                            Forgot password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

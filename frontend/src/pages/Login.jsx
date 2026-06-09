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
        if (e) e.preventDefault();
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

    const handleSSOLogin = async () => {
        setError(null);
        setSubmitting(true);
        // Oxford SSO mock: auto-login with default admin seeds
        try {
            await login("admin@unilms.edu", "Admin@12345");
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
                    <div className="auth-brand-logo" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
                        <img 
                            src="/logo.png" 
                            alt="SVIAS Logo" 
                            style={{ 
                                width: "95px", 
                                height: "95px", 
                                objectFit: "contain", 
                                filter: "drop-shadow(0px 8px 16px rgba(0,0,0,0.3))",
                                marginBottom: "0.5rem"
                            }} 
                        />
                        <span style={{ fontSize: "1.75rem", fontWeight: "800", color: "#FFFFFF", letterSpacing: "-0.02em", textAlign: "center", lineHeight: "1.25" }}>
                            SWAMY VIPULANANDA<br />
                            <span style={{ fontSize: "1.15rem", color: "var(--accent)", fontFamily: "var(--font-heading)", fontWeight: "500", textTransform: "uppercase", display: "block", marginTop: "0.25rem", letterSpacing: "0.04em" }}>
                                Institute of Aesthetic Studies
                            </span>
                            <span style={{ fontSize: "0.95rem", color: "rgba(255, 255, 255, 0.7)", fontWeight: "400", display: "block", marginTop: "0.25rem", letterSpacing: "0.01em" }}>
                                Eastern University, Sri Lanka
                            </span>
                        </span>
                    </div>
                    <p className="auth-brand-tagline" style={{ fontSize: "1.1rem", fontWeight: "400", letterSpacing: "0.02em" }}>
                        Virtual Learning Environment (Canvas)
                    </p>
                    <div className="auth-features">
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Access lecture materials, syllabi, and study resources</span>
                        </div>
                        <div className="auth-feature">
                            <div className="auth-feature-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="20" x2="18" y2="10"/>
                                    <line x1="12" y1="20" x2="12" y2="4"/>
                                    <line x1="6" y1="20" x2="6" y2="14"/>
                                </svg>
                            </div>
                            <span className="auth-feature-text">Complete academic assignments and timed interactive quizzes</span>
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
                            <span className="auth-feature-text">Engage in collaborative course forums and discussion boards</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="auth-form-panel">
                <div className="auth-form-card">
                    <div className="auth-form-header">
                        <h2>VLE Portal Gateway</h2>
                        <p>Sign in to access your student or staff workspace</p>
                    </div>

                    {error && <div className="alert alert-danger animate-fade-in">{error}</div>}

                    {/* Oxford SSO Primary Login Button */}
                    <button 
                        type="button" 
                        onClick={handleSSOLogin}
                        disabled={submitting}
                        className="btn"
                        style={{ 
                            width: "100%", 
                            background: "var(--primary)", 
                            color: "#FFFFFF", 
                            padding: "0.95rem", 
                            fontSize: "0.95rem", 
                            borderRadius: "var(--radius-md)", 
                            border: "1.5px solid var(--accent)", 
                            boxShadow: "0 4px 15px rgba(0,33,71,0.25)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "0.75rem",
                            transition: "var(--transition-smooth)",
                            fontWeight: "700"
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "translateY(-2px)";
                            e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,33,71,0.4)";
                            e.currentTarget.style.background = "var(--primary-600)";
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,33,71,0.25)";
                            e.currentTarget.style.background = "var(--primary)";
                        }}
                    >
                        <img 
                            src="/logo.png" 
                            alt="SVIAS Logo" 
                            style={{ 
                                width: "20px", 
                                height: "20px", 
                                objectFit: "contain",
                                flexShrink: 0
                            }} 
                        />
                        <span>SVIAS Single Sign-On (SSO)</span>
                    </button>

                    <div className="login-divider" style={{ display: "flex", alignItems: "center", margin: "1.8rem 0", color: "var(--text-muted)", fontSize: "0.82rem" }}>
                        <span style={{ flex: 1, height: "1px", background: "rgba(0,33,71,0.08)" }}></span>
                        <span style={{ padding: "0 0.85rem", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>or alternative log in</span>
                        <span style={{ flex: 1, height: "1px", background: "rgba(0,33,71,0.08)" }}></span>
                    </div>

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
                                    placeholder="your-name@unilms.edu"
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
                                    <span>Verifying...</span>
                                </div>
                            ) : "Sign In"}
                        </button>
                    </form>

                    <div className="auth-form-footer" style={{ marginTop: "1.8rem", textAlign: "center" }}>
                        <Link to="/forgot-password" style={{ fontSize: "0.85rem", color: "var(--accent)", fontWeight: "600" }}>
                            Forgotten password?
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../services/api";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [message, setMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setMessage(null);

        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            setMessage("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                navigate("/login");
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.message || "Failed to reset password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="auth-layout" style={{ justifyContent: "center", alignItems: "center" }}>
            <div className="auth-form-panel" style={{ maxWidth: "500px", flex: "1 1 auto" }}>
                <div className="auth-form-card">
                    <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                        <div className="auth-feature-icon" style={{ margin: "0 auto 1rem auto", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-400)" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "24px", height: "24px" }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <h2>Reset Password</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                            Choose a strong password for your account
                        </p>
                    </div>

                    {error && <div className="alert alert-danger animate-fade-in">{error}</div>}
                    {message && <div className="alert alert-success animate-fade-in">{message}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="password">New Password</label>
                            <div className="input-with-icon">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input
                                    type="password"
                                    id="password"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                            <label htmlFor="confirmPassword">Confirm Password</label>
                            <div className="input-with-icon">
                                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    className="form-input"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="btn btn-primary" 
                            style={{ width: "100%" }}
                        >
                            {submitting ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                    <span>Resetting...</span>
                                </div>
                            ) : "Reset Password"}
                        </button>
                    </form>

                    <div className="auth-form-footer" style={{ marginTop: "1.5rem", textAlign: "center" }}>
                        <Link to="/login" style={{ fontSize: "0.85rem", color: "var(--primary-400)" }}>
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;

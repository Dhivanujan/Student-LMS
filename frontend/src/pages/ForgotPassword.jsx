import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [resetLink, setResetLink] = useState(""); // Demo link representation

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setResetLink("");

        if (!email) {
            setError("Please enter your email");
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post("/auth/forgot-password", { email });
            setMessage(response.data.message);
            // Since it's a demo, show the reset link directly so the user can copy-paste it
            if (response.data.resetToken) {
                setResetLink(`/reset-password/${response.data.resetToken}`);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Something went wrong.");
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
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <h2>Forgot Password</h2>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                            Enter your email to receive a password reset token
                        </p>
                    </div>

                    {error && <div className="alert alert-danger animate-fade-in">{error}</div>}
                    {message && <div className="alert alert-success animate-fade-in">{message}</div>}

                    {resetLink && (
                        <div className="alert alert-success animate-fade-in" style={{ wordBreak: "break-all" }}>
                            <strong>Demo Reset Link:</strong> <br />
                            <Link to={resetLink} className="link-alt" style={{ fontWeight: "700", textDecoration: "underline" }}>
                                Reset Password Now (Click here)
                            </Link>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group" style={{ marginBottom: "1.5rem" }}>
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

                        <button 
                            type="submit" 
                            disabled={submitting} 
                            className="btn btn-primary" 
                            style={{ width: "100%" }}
                        >
                            {submitting ? (
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                    <span>Sending...</span>
                                </div>
                            ) : "Send Reset Token"}
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

export default ForgotPassword;

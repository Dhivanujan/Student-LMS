import React, { useState } from "react";
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
        <div className="container flex-center" style={{ minHeight: "85vh" }}>
            <div className="glass-card form-container">
                <h2 className="text-center" style={{ marginBottom: "0.5rem", fontSize: "1.8rem" }}>
                    Reset Password
                </h2>
                <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2.2rem" }}>
                    Choose a strong password for your account
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="password">New Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            className="form-input"
                            placeholder="••••••••"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="btn btn-primary" 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {submitting ? "Resetting..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;

import React, { useState } from "react";
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
        <div className="container flex-center" style={{ minHeight: "85vh" }}>
            <div className="glass-card form-container">
                <h2 className="text-center" style={{ marginBottom: "0.5rem", fontSize: "1.8rem" }}>
                    Forgot Password
                </h2>
                <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2.2rem" }}>
                    Enter your email to receive a password reset token
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {message && <div className="alert alert-success">{message}</div>}

                {resetLink && (
                    <div className="alert alert-success" style={{ wordBreak: "break-all" }}>
                        <strong>Demo Reset Link:</strong> <br />
                        <Link to={resetLink} className="link-alt" style={{ fontWeight: "700" }}>
                            Reset Password Now (Click here)
                        </Link>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="john@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="btn btn-primary" 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {submitting ? "Sending..." : "Send Reset Token"}
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Remember your password?{" "}
                    <Link to="/login" className="link-alt">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;

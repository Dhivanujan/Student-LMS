import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ChangePassword = () => {
    const { user, changePassword, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Live password complexity checks
    const [checks, setChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });

    useEffect(() => {
        setChecks({
            length: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /\d/.test(newPassword),
            special: /[@$!%*?&#]/.test(newPassword)
        });
    }, [newPassword]);

    const isPasswordValid = Object.values(checks).every(val => val === true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!currentPassword) {
            setError("Current password is required");
            return;
        }

        if (!isPasswordValid) {
            setError("Password does not meet the security requirements");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            setSuccess(res.message || "Password changed successfully!");
            setTimeout(() => {
                navigate("/dashboard");
            }, 2000);
        } catch (err) {
            setError(err.message || "Failed to change password. Please verify current password.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: "85vh" }}>
            <div className="glass-card form-container" style={{ maxWidth: "500px" }}>
                
                <h2 className="text-center" style={{ marginBottom: "0.5rem" }}>Change Password</h2>
                <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    {user?.firstLogin 
                        ? "🚨 First Login Detected: You must change your temporary password to secure your account before continuing." 
                        : "Change your password to secure your account credentials."
                    }
                </p>

                {error && <div className="alert alert-danger">{error}</div>}
                {success && <div className="alert alert-success">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current / Temporary Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••" 
                            value={currentPassword} 
                            onChange={e => setCurrentPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    {/* Complexity Checklist Display */}
                    <div style={{ background: "rgba(0,0,0,0.15)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginBottom: "1.5rem" }}>
                        <h4 style={{ fontSize: "0.85rem", marginBottom: "0.5rem", color: "var(--text-muted)" }}>Password Security Rules:</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem" }}>
                            <div style={{ color: checks.length ? "var(--success)" : "var(--error)" }}>
                                {checks.length ? "✓" : "✕"} Minimum 8 characters
                            </div>
                            <div style={{ color: checks.upper ? "var(--success)" : "var(--error)" }}>
                                {checks.upper ? "✓" : "✕"} At least one uppercase letter (A-Z)
                            </div>
                            <div style={{ color: checks.lower ? "var(--success)" : "var(--error)" }}>
                                {checks.lower ? "✓" : "✕"} At least one lowercase letter (a-z)
                            </div>
                            <div style={{ color: checks.number ? "var(--success)" : "var(--error)" }}>
                                {checks.number ? "✓" : "✕"} At least one number (0-9)
                            </div>
                            <div style={{ color: checks.special ? "var(--success)" : "var(--error)" }}>
                                {checks.special ? "✓" : "✕"} At least one special character (@$!%*?&#)
                            </div>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm New Password</label>
                        <input 
                            type="password" 
                            className="form-input" 
                            placeholder="••••••••" 
                            value={confirmPassword} 
                            onChange={e => setConfirmPassword(e.target.value)} 
                            required 
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={submitting || !isPasswordValid} 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {submitting ? "Updating..." : "Update Password & Continue"}
                    </button>
                </form>

                {/* Allow logging out if they want to exit */}
                <div className="text-center" style={{ marginTop: "1.5rem" }}>
                    <button onClick={logout} className="link-alt" style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem" }}>
                        Cancel and Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;

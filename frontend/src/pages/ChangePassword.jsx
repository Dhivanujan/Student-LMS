import { useState, useContext } from "react";
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

    // Live password complexity checks computed on render
    const checks = {
        length: newPassword.length >= 8,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[@$!%*?&#]/.test(newPassword)
    };

    const isPasswordValid = Object.values(checks).every(val => val === true);
    const metCount = Object.values(checks).filter(Boolean).length;
    
    const getStrengthClass = () => {
        if (newPassword.length === 0) return "";
        if (metCount <= 2) return "weak";
        if (metCount <= 4) return "fair";
        return "strong";
    };

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
            <div className="glass-card-static form-container animate-scale-in" style={{ maxWidth: "500px", width: "100%" }}>
                <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
                    <div className="auth-feature-icon" style={{ margin: "0 auto 1rem auto", width: "48px", height: "48px", borderRadius: "12px", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary-400)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "24px", height: "24px" }}>
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                        </svg>
                    </div>
                    <h2>Change Password</h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
                        {user?.firstLogin 
                            ? "First Login Detected: You must change your temporary password to secure your account." 
                            : "Change your password to secure your account credentials."
                        }
                    </p>
                </div>

                {user?.firstLogin && (
                    <div className="alert alert-warning animate-fade-in" style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginBottom: "1.5rem" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px", flexShrink: 0 }}>
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        <span style={{ fontSize: "0.85rem" }}>Temporary credentials must be replaced to unlock portal features.</span>
                    </div>
                )}

                {error && <div className="alert alert-danger animate-fade-in">{error}</div>}
                {success && <div className="alert alert-success animate-fade-in">{success}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Current / Temporary Password</label>
                        <div className="input-with-icon">
                            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                value={currentPassword} 
                                onChange={e => setCurrentPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>New Password</label>
                        <div className="input-with-icon">
                            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    {/* Complexity Checklist Display */}
                    {newPassword.length > 0 && (
                        <div style={{ marginBottom: "1.5rem" }}>
                            <div className="password-strength-bar">
                                <div className={`password-strength-fill ${getStrengthClass()}`} style={{ width: `${(metCount / 5) * 100}%` }}></div>
                            </div>
                            <div className="password-checks" style={{ marginTop: "1rem" }}>
                                <div className={`password-check ${checks.length ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>Minimum 8 characters</span>
                                </div>
                                <div className={`password-check ${checks.upper ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one uppercase letter (A-Z)</span>
                                </div>
                                <div className={`password-check ${checks.lower ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one lowercase letter (a-z)</span>
                                </div>
                                <div className={`password-check ${checks.number ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one number (0-9)</span>
                                </div>
                                <div className={`password-check ${checks.special ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one special character (@$!%*?&#)</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="form-group" style={{ marginTop: "1rem" }}>
                        <label>Confirm New Password</label>
                        <div className="input-with-icon">
                            <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            <input 
                                type="password" 
                                className="form-input" 
                                placeholder="••••••••" 
                                value={confirmPassword} 
                                onChange={e => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={submitting || !isPasswordValid} 
                        style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}
                    >
                        {submitting ? (
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                <span>Updating Password...</span>
                            </div>
                        ) : "Update Password & Continue"}
                    </button>
                </form>

                {/* Allow logging out if they want to exit */}
                <div className="text-center" style={{ marginTop: "1.5rem" }}>
                    <button onClick={logout} className="btn btn-outline btn-sm" style={{ border: "none", background: "none", cursor: "pointer", fontSize: "0.85rem" }}>
                        Cancel and Log Out
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChangePassword;

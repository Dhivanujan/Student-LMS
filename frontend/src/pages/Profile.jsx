import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
    const { user, updateProfile, changePassword } = useContext(AuthContext);
    const [name, setName] = useState(user?.name || "");
    const [specialization, setSpecialization] = useState(user?.specialization || "");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Change Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdError, setPwdError] = useState(null);
    const [pwdSuccess, setPwdSuccess] = useState(null);
    const [pwdSubmitting, setPwdSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            const timer = setTimeout(() => {
                setName(user.name || "");
                setSpecialization(user.specialization || "");
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [user]);

    // Live password complexity checks computed on render
    const pwdChecks = {
        length: newPassword.length >= 8,
        upper: /[A-Z]/.test(newPassword),
        lower: /[a-z]/.test(newPassword),
        number: /\d/.test(newPassword),
        special: /[@$!%*?&#]/.test(newPassword)
    };

    const isPasswordValid = Object.values(pwdChecks).every(val => val === true);
    const metCount = Object.values(pwdChecks).filter(Boolean).length;
    
    const getStrengthClass = () => {
        if (newPassword.length === 0) return "";
        if (metCount <= 2) return "weak";
        if (metCount <= 4) return "fair";
        return "strong";
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        setFile(selectedFile);
        if (selectedFile) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(selectedFile);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSubmitting(true);

        const formData = new FormData();
        formData.append("name", name);
        if (user.role === "lecturer") {
            formData.append("specialization", specialization);
        }
        if (file) {
            formData.append("profilePicture", file);
        }

        try {
            await updateProfile(formData);
            setSuccess("Profile settings saved successfully!");
            setFile(null);
        } catch (err) {
            setError(err.message || "Failed to update profile.");
        } finally {
            setSubmitting(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setPwdError(null);
        setPwdSuccess(null);

        if (!currentPassword) {
            setPwdError("Current password is required");
            return;
        }

        if (!isPasswordValid) {
            setPwdError("Password does not meet the security requirements");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPwdError("Passwords do not match");
            return;
        }

        setPwdSubmitting(true);
        try {
            const res = await changePassword(currentPassword, newPassword);
            setPwdSuccess(res.message || "Password updated successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setPwdError(err.message || "Failed to update password. Please check your current password.");
        } finally {
            setPwdSubmitting(false);
        }
    };

    if (!user) return <div className="loading-spinner"><div className="spinner"></div><p className="loading-text">Loading profile...</p></div>;

    const displayId = user.registrationNumber || user.studentId || user.lecturerId || "ADMIN-001";
    const departmentStr = user.department 
        ? (typeof user.department === "object" ? `${user.department.code || ""} - ${user.department.name || ""}` : user.department)
        : "";

    return (
        <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
                <h1 className="page-title">My Profile Settings</h1>
                <p className="page-subtitle">Update your personal account credentials and profile display image.</p>
            </div>

            {/* Profile Overview Card */}
            <div className="glass-card-static" style={{ padding: 0, overflow: "hidden" }}>
                <div className="profile-banner"></div>
                <div style={{ padding: "2rem", marginTop: "-4rem", display: "flex", flexDirection: "column", alignItems: "center", borderBottom: "1px solid var(--border-color)" }}>
                    <div className="profile-avatar-wrapper" style={{ position: "relative" }}>
                        {preview ? (
                            <img 
                                src={preview} 
                                alt="Preview" 
                                className="profile-avatar-large"
                            />
                        ) : user.profilePicture ? (
                            <img 
                                src={`http://localhost:5000${user.profilePicture}`} 
                                alt={user.name} 
                                className="profile-avatar-large"
                            />
                        ) : (
                            <div className="profile-avatar-large" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--primary-glow)", fontSize: "2.5rem", fontWeight: "700", color: "var(--text-main)" }}>
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <label className="profile-avatar-upload-btn" title="Upload Photo" style={{ position: "absolute", bottom: "4px", right: "4px", background: "var(--role-accent)", color: "var(--background-dark)", width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "2px solid var(--background-dark)", boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                                <circle cx="12" cy="13" r="4"/>
                            </svg>
                            <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
                        </label>
                    </div>

                    <h2 style={{ marginTop: "1rem", marginBottom: "0.25rem", fontSize: "1.5rem" }}>{user.name}</h2>
                    <span className="badge badge-student" style={{ textTransform: "uppercase", fontSize: "0.75rem", fontWeight: "700" }}>{user.role}</span>
                </div>

                {/* Profile Details Info Grid */}
                <div className="profile-info-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", padding: "2rem" }}>
                    <div className="profile-info-item">
                        <div className="profile-info-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                <polyline points="22,6 12,13 2,6"/>
                            </svg>
                        </div>
                        <div>
                            <div className="profile-info-label">Email Address</div>
                            <div className="profile-info-value">{user.email}</div>
                        </div>
                    </div>

                    <div className="profile-info-item">
                        <div className="profile-info-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                        </div>
                        <div>
                            <div className="profile-info-label">Identification ID</div>
                            <div className="profile-info-value">{displayId}</div>
                        </div>
                    </div>

                    {departmentStr && (
                        <div className="profile-info-item">
                            <div className="profile-info-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                                    <line x1="9" y1="22" x2="9" y2="16"/>
                                    <line x1="15" y1="22" x2="15" y2="16"/>
                                </svg>
                            </div>
                            <div>
                                <div className="profile-info-label">Department</div>
                                <div className="profile-info-value" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>{departmentStr}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Edit Card */}
            <div className="glass-card-static">
                <h3 style={{ marginBottom: "1.5rem" }}>Update Account Profile</h3>
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: "1.25rem" }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>{success}</div>}

                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-input" value={name} onChange={e => setName(e.target.value)} required />
                    </div>

                    {user.role === "lecturer" && (
                        <div className="form-group">
                            <label>Lecturer Specialization</label>
                            <input type="text" className="form-input" placeholder="e.g. Artificial Intelligence" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: "1rem" }}>
                        {submitting ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                <span>Saving settings...</span>
                            </div>
                        ) : "Save Profile Settings"}
                    </button>
                </form>
            </div>

            {/* Change Password Card */}
            <div className="glass-card-static">
                <h3 style={{ marginBottom: "0.5rem" }}>Security & Password</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Update your account password. Make sure it adheres to length and character guidelines.</p>

                {pwdError && <div className="alert alert-danger" style={{ marginBottom: "1.25rem" }}>{pwdError}</div>}
                {pwdSuccess && <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>{pwdSuccess}</div>}

                <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
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
                                <div className={`password-check ${pwdChecks.length ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>Minimum 8 characters</span>
                                </div>
                                <div className={`password-check ${pwdChecks.upper ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one uppercase letter (A-Z)</span>
                                </div>
                                <div className={`password-check ${pwdChecks.lower ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one lowercase letter (a-z)</span>
                                </div>
                                <div className={`password-check ${pwdChecks.number ? "met" : ""}`}>
                                    <div className="password-check-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                    </div>
                                    <span>At least one number (0-9)</span>
                                </div>
                                <div className={`password-check ${pwdChecks.special ? "met" : ""}`}>
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
                        disabled={pwdSubmitting || !isPasswordValid} 
                        style={{ width: "100%", marginTop: "1.5rem" }}
                    >
                        {pwdSubmitting ? (
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                                <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                <span>Updating Password...</span>
                            </div>
                        ) : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;

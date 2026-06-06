import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
    const { user, updateProfile, changePassword } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Change Password Form State
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [pwdChecks, setPwdChecks] = useState({
        length: false,
        upper: false,
        lower: false,
        number: false,
        special: false
    });
    const [pwdError, setPwdError] = useState(null);
    const [pwdSuccess, setPwdSuccess] = useState(null);
    const [pwdSubmitting, setPwdSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setSpecialization(user.specialization || "");
        }
    }, [user]);

    useEffect(() => {
        setPwdChecks({
            length: newPassword.length >= 8,
            upper: /[A-Z]/.test(newPassword),
            lower: /[a-z]/.test(newPassword),
            number: /\d/.test(newPassword),
            special: /[@$!%*?&#]/.test(newPassword)
        });
    }, [newPassword]);

    const isPasswordValid = Object.values(pwdChecks).every(val => val === true);

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

    if (!user) return <div className="text-center">Loading profile...</div>;

    const displayId = user.registrationNumber || user.studentId || user.lecturerId || "ADMIN-001";
    const departmentStr = user.department 
        ? (typeof user.department === "object" ? `${user.department.code || ""} - ${user.department.name || ""}` : user.department)
        : "";

    return (
        <div style={{ maxWidth: "700px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "2rem" }}>
            <div>
                <h1 className="page-title">My Profile Settings</h1>
                <p className="page-subtitle">Update your personal account credentials and profile display image.</p>
            </div>

            {/* Profile Info Card */}
            <div className="glass-card" style={{ display: "grid", gridTemplateColumns: "1fr 2.5fr", gap: "2rem", alignItems: "center" }}>
                {/* Photo Preview and Selection */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
                    {preview ? (
                        <img 
                            src={preview} 
                            alt="Preview" 
                            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} 
                        />
                    ) : user.profilePicture ? (
                        <img 
                            src={`http://localhost:5000${user.profilePicture}`} 
                            alt={user.name} 
                            style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "2px solid var(--primary)" }} 
                        />
                    ) : (
                        <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "600", color: "#fff" }}>
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    
                    <label className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", cursor: "pointer", textAlign: "center" }}>
                        Choose Photo
                        <input type="file" onChange={handleFileChange} style={{ display: "none" }} accept="image/*" />
                    </label>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{error}</div>}
                    {success && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{success}</div>}

                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" value={user.email} disabled style={{ background: "rgba(0,0,0,0.3)", cursor: "not-allowed", color: "var(--text-muted)" }} />
                    </div>

                    <div className="form-group">
                        <label>Registration / Employee ID</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={displayId} 
                            disabled 
                            style={{ background: "rgba(0,0,0,0.3)", cursor: "not-allowed", color: "var(--text-muted)" }} 
                        />
                    </div>

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

                    {departmentStr && (
                        <div className="form-group">
                            <label>Assigned Department</label>
                            <input type="text" className="form-input" value={departmentStr} disabled style={{ background: "rgba(0,0,0,0.3)", cursor: "not-allowed", color: "var(--text-muted)" }} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: "1rem" }}>
                        {submitting ? "Saving..." : "Save Profile Settings"}
                    </button>
                </form>
            </div>

            {/* Change Password Card */}
            <div className="glass-card">
                <h3 style={{ marginBottom: "0.5rem" }}>Security & Password</h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>Update your password credentials. Ensure it meets complexity guidelines.</p>

                {pwdError && <div className="alert alert-danger" style={{ marginBottom: "1rem" }}>{pwdError}</div>}
                {pwdSuccess && <div className="alert alert-success" style={{ marginBottom: "1rem" }}>{pwdSuccess}</div>}

                <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                        <label>Current Password</label>
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
                            <div style={{ color: pwdChecks.length ? "var(--success)" : "var(--error)" }}>
                                {pwdChecks.length ? "✓" : "✕"} Minimum 8 characters
                            </div>
                            <div style={{ color: pwdChecks.upper ? "var(--success)" : "var(--error)" }}>
                                {pwdChecks.upper ? "✓" : "✕"} At least one uppercase letter (A-Z)
                            </div>
                            <div style={{ color: pwdChecks.lower ? "var(--success)" : "var(--error)" }}>
                                {pwdChecks.lower ? "✓" : "✕"} At least one lowercase letter (a-z)
                            </div>
                            <div style={{ color: pwdChecks.number ? "var(--success)" : "var(--error)" }}>
                                {pwdChecks.number ? "✓" : "✕"} At least one number (0-9)
                            </div>
                            <div style={{ color: pwdChecks.special ? "var(--success)" : "var(--error)" }}>
                                {pwdChecks.special ? "✓" : "✕"} At least one special character (@$!%*?&#)
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
                        disabled={pwdSubmitting || !isPasswordValid} 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {pwdSubmitting ? "Updating Password..." : "Change Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;

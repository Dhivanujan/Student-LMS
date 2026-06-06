import React, { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Profile = () => {
    const { user, updateProfile } = useContext(AuthContext);
    const [name, setName] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState("");

    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setSpecialization(user.specialization || "");
        }
    }, [user]);

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

    if (!user) return <div className="text-center">Loading profile...</div>;

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h1 className="page-title">My Profile Settings</h1>
            <p className="page-subtitle">Update your personal account credentials and profile display image.</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

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
                        <div style={{ width: "120px", height: "120px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", fontWeight: "600" }}>
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
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" value={user.email} disabled style={{ background: "rgba(0,0,0,0.3)", cursor: "not-allowed", color: "var(--text-muted)" }} />
                    </div>

                    <div className="form-group">
                        <label>Account ID Code</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            value={user.role === "student" ? user.studentId : user.role === "lecturer" ? user.lecturerId : "ADMINISTRATOR"} 
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

                    {user.department && (
                        <div className="form-group">
                            <label>Assigned Department</label>
                            <input type="text" className="form-input" value={`${user.department.code} - ${user.department.name}`} disabled style={{ background: "rgba(0,0,0,0.3)", cursor: "not-allowed", color: "var(--text-muted)" }} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: "1rem" }}>
                        {submitting ? "Saving..." : "Save Profile Settings"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Profile;

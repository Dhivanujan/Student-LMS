import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";

const Admin = () => {
    const [searchParams] = useSearchParams();
    const activeTab = searchParams.get("tab") || "users";

    // General state
    const [departments, setDepartments] = useState([]);
    const [faculties, setFaculties] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadCoreData = async () => {
        try {
            const [deptsRes, facsRes, usersRes] = await Promise.all([
                api.get("/users/departments"),
                api.get("/users/faculties"),
                api.get("/users?role=lecturer")
            ]);
            setDepartments(deptsRes.data.data);
            setFaculties(facsRes.data.data);
            setLecturers(usersRes.data.data);
        } catch (err) {
            console.error("Failed to load admin prerequisite data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            loadCoreData();
        }, 0);
        return () => clearTimeout(timer);
    }, [activeTab]);

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: "60vh" }}>
                <div className="spinner"></div>
                <p className="loading-text">Loading Admin Panel Data...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <div className="glass-card-static animate-slide-up stagger-1" style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">University Admin Console</h1>
                <p className="page-subtitle" style={{ margin: 0 }}>
                    Global configuration settings. Academic structures, user rosters, course catalog, and active enrollment requests.
                </p>
            </div>

            {activeTab === "users" && <UsersPanel departments={departments} />}
            {activeTab === "courses" && <CoursesPanel departments={departments} lecturers={lecturers} />}
            {activeTab === "enrollments" && <EnrollmentsPanel />}
            {activeTab === "faculties" && <FacultiesPanel faculties={faculties} departments={departments} onReload={loadCoreData} />}
            {activeTab === "audit-logs" && <AuditLogsPanel />}
        </div>
    );
};

// ==========================================================================
// 1. USERS PANEL - CRUD STUDENTS & LECTURERS
// ==========================================================================
const UsersPanel = ({ departments }) => {
    const [users, setUsers] = useState([]);
    const [roleFilter, setRoleFilter] = useState("student");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    // Form states
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [registrationNumber, setRegistrationNumber] = useState("");
    const [role, setRole] = useState("student");
    const [department, setDepartment] = useState("");
    const [specialization, setSpecialization] = useState("");
    const [error, setError] = useState(null);
    const [createdTempPassword, setCreatedTempPassword] = useState("");

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users?role=${roleFilter}&search=${search}`);
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [roleFilter, search]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchUsers();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setError(null);
        setCreatedTempPassword("");

        if (!name || !email || !registrationNumber) {
            return setError("Please fill in name, email, and registration number");
        }

        try {
            const res = await api.post("/users", { 
                name, 
                email, 
                role, 
                department, 
                registrationNumber, 
                specialization 
            });
            setCreatedTempPassword(res.data.temporaryPassword);
            setName("");
            setEmail("");
            setRegistrationNumber("");
            setDepartment("");
            setSpecialization("");
            fetchUsers();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create user");
        }
    };

    const handleToggleStatus = async (uId, currentStatus) => {
        try {
            const res = await api.put(`/users/${uId}/toggle-status`, { isActive: !currentStatus });
            alert(res.data.message || "User status updated successfully!");
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to toggle status");
        }
    };

    const handleResetPassword = async (uId, email) => {
        if (!window.confirm(`Are you sure you want to reset the password for ${email}?`)) return;
        try {
            const res = await api.put(`/users/${uId}/reset-password`);
            setCreatedTempPassword(res.data.temporaryPassword);
            alert("Password reset completed! The new temporary password is shown in the banner above.");
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to reset password");
        }
    };

    const handleDeleteUser = async (uId) => {
        if (!window.confirm("Delete this user permanently?")) return;
        try {
            await api.delete(`/users/${uId}`);
            fetchUsers();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    return (
        <div className="form-row animate-slide-up stagger-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
            <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 style={{ margin: 0 }}>User Accounts Registry</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setRoleFilter("student")} className={`btn ${roleFilter === "student" ? "btn-primary" : "btn-outline"}`} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Students</button>
                        <button onClick={() => setRoleFilter("lecturer")} className={`btn ${roleFilter === "lecturer" ? "btn-primary" : "btn-outline"}`} style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>Lecturers</button>
                    </div>
                </div>

                {/* Temporary Password Banner */}
                {createdTempPassword && (
                    <div className="alert alert-success animate-fade-in" style={{ padding: "1.2rem", borderRadius: "12px", marginBottom: "1.5rem", position: "relative" }}>
                        <h4 style={{ color: "var(--success)", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            Temporary Password Generated
                        </h4>
                        <p style={{ margin: "0 0 0.8rem 0", fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                            Copy the password below. The user is required to change this upon their first login to gain access.
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "0.5rem 0.8rem", borderRadius: "8px", border: "1px solid var(--border-color)", width: "fit-content" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", color: "#fff", letterSpacing: "1px" }}>{createdTempPassword}</span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(createdTempPassword);
                                    alert("Password copied to clipboard!");
                                }} 
                                className="btn btn-outline btn-sm" 
                                style={{ padding: "0.2rem 0.5rem" }}
                            >
                                Copy
                            </button>
                        </div>
                        <button 
                            onClick={() => setCreatedTempPassword("")} 
                            style={{ position: "absolute", top: "0.8rem", right: "0.8rem", background: "none", border: "none", color: "var(--text-muted)", fontSize: "1.1rem", cursor: "pointer" }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                    <div className="input-with-icon">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <input type="text" className="form-input" placeholder="Search users by name, email, or registration ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                {loading ? (
                    <div className="loading-spinner" style={{ padding: "2rem" }}>
                        <div className="spinner"></div>
                        <p className="loading-text">Loading registry records...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="8" x2="12" y2="12"/>
                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">No accounts found</div>
                        <div className="empty-state-text">No registry records match your query.</div>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ flex: 1 }}>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>ID Code</th>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(u => (
                                    <tr key={u._id}>
                                        <td><strong>{u.registrationNumber || (u.role === "student" ? u.studentId : u.lecturerId) || "N/A"}</strong></td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>
                                            {u.department || u.departmentId?.code ? (
                                                <span className="badge badge-student" style={{ fontSize: "0.7rem", fontWeight: "700" }}>{u.department || u.departmentId?.code}</span>
                                            ) : "None"}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${u.isActive !== false ? "success" : "danger"}`} style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                                                {u.isActive !== false ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button 
                                                    onClick={() => handleToggleStatus(u._id, u.isActive !== false)} 
                                                    className="btn-icon" 
                                                    title={u.isActive !== false ? "Suspend Account" : "Activate Account"}
                                                    style={{ color: u.isActive !== false ? "var(--error)" : "var(--success)", background: "rgba(255,255,255,0.02)" }}
                                                >
                                                    {u.isActive !== false ? (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <circle cx="12" cy="12" r="10"/>
                                                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                                                        </svg>
                                                    ) : (
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                            <polyline points="20 6 9 17 4 12"/>
                                                        </svg>
                                                    )}
                                                </button>
                                                <button 
                                                    onClick={() => handleResetPassword(u._id, u.email)} 
                                                    className="btn-icon"
                                                    title="Reset Password"
                                                    style={{ color: "var(--primary-400)", background: "rgba(255,255,255,0.02)" }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                                    </svg>
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u._id)} 
                                                    className="btn-icon"
                                                    title="Delete Account"
                                                    style={{ color: "var(--error)", background: "rgba(255,255,255,0.02)" }}
                                                >
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <polyline points="3 6 5 6 21 6"/>
                                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="glass-card-static" style={{ height: "fit-content" }}>
                <h3>Create User Account</h3>
                {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}
                <form onSubmit={handleCreateUser} style={{ marginTop: "1.25rem" }}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input type="text" className="form-input" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input type="email" className="form-input" placeholder="john@uni.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Registration / Employee ID</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="e.g. STU-2026-004 or LEC-992" 
                            value={registrationNumber} 
                            onChange={e => setRegistrationNumber(e.target.value)} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Role</label>
                        <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ background: "var(--background-dark)" }}>
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Department (Optional)</label>
                        <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)} style={{ background: "var(--background-dark)" }}>
                            <option value="">None</option>
                            {departments.map(d => (
                                <option key={d._id} value={d.name}>{d.code} - {d.name}</option>
                            ))}
                        </select>
                    </div>

                    {role === "lecturer" && (
                        <div className="form-group animate-slide-down">
                            <label>Specialization Field</label>
                            <input type="text" className="form-input" placeholder="e.g. Theoretical Physics" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>Create Account</button>
                </form>
            </div>
        </div>
    );
};

// ==========================================================================
// 2. COURSES PANEL - CRUD COURSES & LECTURERS ASSIGN
// ==========================================================================
const CoursesPanel = ({ departments, lecturers }) => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Create course states
    const [code, setCode] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [credits, setCredits] = useState(3);
    const [semester, setSemester] = useState("Fall 2026");
    const [departmentId, setDepartmentId] = useState("");
    const [lecturerId, setLecturerId] = useState("");
    const [error, setError] = useState(null);

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/courses");
            setCourses(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourses();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchCourses]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        setError(null);
        if (!code || !name || !departmentId) return setError("Please fill in required parameters");

        try {
            await api.post("/courses", { code, name, description, credits, semester, departmentId, lecturerId: lecturerId || null });
            alert("Course created successfully!");
            setCode("");
            setName("");
            setDescription("");
            setLecturerId("");
            fetchCourses();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create course");
        }
    };

    const handleDeleteCourse = async (cId) => {
        if (!window.confirm("Delete course permanently? All submissions and grades will be cleared.")) return;
        try {
            await api.delete(`/courses/${cId}`);
            fetchCourses();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const handleAssignLecturer = async (cId, lecId) => {
        try {
            await api.put(`/courses/${cId}/assign-lecturer`, { lecturerId: lecId || null });
            alert("Lecturer assignment saved!");
            fetchCourses();
        } catch (err) {
            alert(err.response?.data?.message || "Assignment failed");
        }
    };

    return (
        <div className="form-row animate-slide-up stagger-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
            <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                <h3>Course Catalog Registry</h3>
                {loading ? (
                    <div className="loading-spinner" style={{ padding: "2rem" }}>
                        <div className="spinner"></div>
                        <p className="loading-text">Loading catalog records...</p>
                    </div>
                ) : courses.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">No courses registered</div>
                        <div className="empty-state-text">No catalog logs present. Create a new course to start.</div>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ flex: 1, marginTop: "1rem" }}>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Course Name</th>
                                    <th>Department</th>
                                    <th>Lecturer</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c._id}>
                                        <td><span className="badge badge-student" style={{ fontSize: "0.75rem", fontWeight: "700" }}>{c.code}</span></td>
                                        <td>{c.name}</td>
                                        <td>{c.departmentId?.code}</td>
                                        <td>
                                            <select 
                                                value={c.lecturerId?._id || ""} 
                                                onChange={e => handleAssignLecturer(c._id, e.target.value)}
                                                className="form-input"
                                                style={{ background: "var(--background-dark)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "0.3rem 0.5rem", borderRadius: "6px", fontSize: "0.8rem" }}
                                            >
                                                <option value="">Unassigned</option>
                                                {lecturers.map(l => (
                                                    <option key={l._id} value={l._id}>{l.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteCourse(c._id)} 
                                                className="btn-icon" 
                                                title="Delete Course"
                                                style={{ color: "var(--error)", background: "rgba(255,255,255,0.02)" }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="glass-card-static" style={{ height: "fit-content" }}>
                <h3>Create New Course Section</h3>
                {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}
                <form onSubmit={handleCreateCourse} style={{ marginTop: "1.25rem" }}>
                    <div className="form-group">
                        <label>Course Code</label>
                        <input type="text" className="form-input" placeholder="e.g. COMP303" value={code} onChange={e => setCode(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Course Name</label>
                        <input type="text" className="form-input" placeholder="e.g. Database Systems" value={name} onChange={e => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Description</label>
                        <textarea className="form-input" rows="3" placeholder="Course goals..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                    </div>

                    <div style={{ display: "flex", gap: "1rem" }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Credits</label>
                            <input type="number" className="form-input" value={credits} onChange={e => setCredits(parseInt(e.target.value))} required />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Semester</label>
                            <input type="text" className="form-input" value={semester} onChange={e => setSemester(e.target.value)} required />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Department</label>
                        <select className="form-input" value={departmentId} onChange={e => setDepartmentId(e.target.value)} style={{ background: "var(--background-dark)" }} required>
                            <option value="">Select Department</option>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assign Initial Lecturer (Optional)</label>
                        <select className="form-input" value={lecturerId} onChange={e => setLecturerId(e.target.value)} style={{ background: "var(--background-dark)" }}>
                            <option value="">Unassigned</option>
                            {lecturers.map(l => (
                                <option key={l._id} value={l._id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>Create Course</button>
                </form>
            </div>
        </div>
    );
};

// ==========================================================================
// 3. ENROLLMENTS PANEL - APPROVE/REJECT STUDENT REQUESTS
// ==========================================================================
const EnrollmentsPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const res = await api.get("/enrollments?status=pending");
            setRequests(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRequests();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchRequests]);

    const handleApproval = async (id, approve) => {
        try {
            if (approve) {
                await api.put(`/enrollments/${id}/approve`);
                alert("Enrollment approved!");
            } else {
                await api.put(`/enrollments/${id}/reject`);
                alert("Enrollment rejected.");
            }
            fetchRequests();
        } catch (err) {
            console.error(err);
            alert("Action failed");
        }
    };

    return (
        <div className="glass-card-static animate-slide-up stagger-2">
            <h3>Pending Enrollment Requests</h3>
            {loading ? (
                <div className="loading-spinner" style={{ padding: "2rem" }}>
                    <div className="spinner"></div>
                    <p className="loading-text">Loading enrollment approvals...</p>
                </div>
            ) : requests.length === 0 ? (
                <div className="empty-state" style={{ padding: "4rem 2rem" }}>
                    <div className="empty-state-icon" style={{ color: "var(--success)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <div className="empty-state-title">All caught up!</div>
                    <div className="empty-state-text">No pending enrollment requests require approval.</div>
                </div>
            ) : (
                <div className="table-responsive" style={{ marginTop: "1.5rem" }}>
                    <table className="premium-table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Student Name</th>
                                <th>Course Code</th>
                                <th>Course Name</th>
                                <th>Semester</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r._id}>
                                    <td><strong>{r.studentId?.studentId}</strong></td>
                                    <td>{r.studentId?.name}</td>
                                    <td><span className="badge badge-student" style={{ fontSize: "0.75rem", fontWeight: "700" }}>{r.courseId?.code}</span></td>
                                    <td>{r.courseId?.name}</td>
                                    <td>{r.semester}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button 
                                                onClick={() => handleApproval(r._id, true)} 
                                                className="btn btn-primary btn-sm" 
                                                style={{ padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "12px", height: "12px" }}>
                                                    <polyline points="20 6 9 17 4 12"/>
                                                </svg>
                                                <span>Approve</span>
                                            </button>
                                            <button 
                                                onClick={() => handleApproval(r._id, false)} 
                                                className="btn btn-danger btn-sm" 
                                                style={{ padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "12px", height: "12px" }}>
                                                    <line x1="18" y1="6" x2="6" y2="18"/>
                                                    <line x1="6" y1="6" x2="18" y2="18"/>
                                                </svg>
                                                <span>Reject</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 4. ACADEMIC UNITS PANEL - FACULTIES & DEPARTMENTS
// ==========================================================================
const FacultiesPanel = ({ faculties, departments, onReload }) => {
    // Faculty creation
    const [fName, setFName] = useState("");
    const [fDesc, setFDesc] = useState("");
    // Department creation
    const [dName, setDName] = useState("");
    const [dCode, setDCode] = useState("");
    const [facultyId, setFacultyId] = useState("");

    const handleCreateFaculty = async (e) => {
        e.preventDefault();
        if (!fName) return;
        try {
            await api.post("/users/faculties", { name: fName, description: fDesc });
            setFName("");
            setFDesc("");
            alert("Faculty created!");
            onReload();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleCreateDepartment = async (e) => {
        e.preventDefault();
        if (!dName || !dCode || !facultyId) return;
        try {
            await api.post("/users/departments", { name: dName, code: dCode, facultyId });
            setDName("");
            setDCode("");
            alert("Department created!");
            onReload();
        } catch (err) {
            alert(err.response?.data?.message || "Failed");
        }
    };

    const handleDeleteDept = async (id) => {
        if (!window.confirm("Delete department?")) return;
        try {
            await api.delete(`/users/departments/${id}`);
            onReload();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    return (
        <div className="form-row animate-slide-up stagger-2" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
            
            {/* List and CRUD forms */}
            <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                <h3>Departments & Academic Units</h3>
                {departments.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                                <line x1="9" y1="22" x2="9" y2="16"/>
                                <line x1="15" y1="22" x2="15" y2="16"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">No departments created</div>
                        <div className="empty-state-text">Registry contains no academic departments.</div>
                    </div>
                ) : (
                    <div className="table-responsive" style={{ flex: 1, marginTop: "1.5rem" }}>
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Department Name</th>
                                    <th>Parent Faculty</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map(d => (
                                    <tr key={d._id}>
                                        <td><span className="badge badge-student" style={{ fontSize: "0.75rem", fontWeight: "700" }}>{d.code}</span></td>
                                        <td>{d.name}</td>
                                        <td>{d.facultyId?.name}</td>
                                        <td>
                                            <button 
                                                onClick={() => handleDeleteDept(d._id)} 
                                                className="btn-icon" 
                                                title="Delete Department"
                                                style={{ color: "var(--error)", background: "rgba(255,255,255,0.02)" }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                {/* Faculty creator */}
                <div className="glass-card-static">
                    <h4>Create Faculty Unit</h4>
                    <form onSubmit={handleCreateFaculty} style={{ marginTop: "1rem" }}>
                        <div className="form-group">
                            <label>Faculty Name</label>
                            <input type="text" className="form-input" placeholder="e.g. Science & Engineering" value={fName} onChange={e => setFName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Description</label>
                            <input type="text" className="form-input" placeholder="General description..." value={fDesc} onChange={e => setFDesc(e.target.value)} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>Create Faculty</button>
                    </form>
                </div>

                {/* Department Creator */}
                <div className="glass-card-static">
                    <h4>Create Department Unit</h4>
                    <form onSubmit={handleCreateDepartment} style={{ marginTop: "1rem" }}>
                        <div className="form-group">
                            <label>Dept Code</label>
                            <input type="text" className="form-input" placeholder="e.g. CS" value={dCode} onChange={e => setDCode(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Dept Name</label>
                            <input type="text" className="form-input" placeholder="e.g. Computer Science" value={dName} onChange={e => setDName(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Faculty Parent</label>
                            <select className="form-input" value={facultyId} onChange={e => setFacultyId(e.target.value)} style={{ background: "var(--background-dark)" }} required>
                                <option value="">Select Faculty</option>
                                {faculties.map(f => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>Create Department</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

// ==========================================================================
// 5. SYSTEM AUDIT LOG PANEL
// ==========================================================================
const AuditLogsPanel = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await api.get("/users/audit-logs");
                setLogs(res.data.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLogs();
    }, []);

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: "30vh" }}>
                <div className="spinner"></div>
                <p className="loading-text">Loading audit trails...</p>
            </div>
        );
    }

    return (
        <div className="glass-card-static animate-slide-up stagger-2">
            <h3>System Activity Audit Trails</h3>
            <p className="page-subtitle" style={{ fontSize: "0.9rem", marginBottom: "2rem" }}>
                Displays chronological records of user authentication actions, enrollment changes, course catalog CRUDs, and security events.
            </p>

            {logs.length === 0 ? (
                <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                    <div className="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                    </div>
                    <div className="empty-state-title">No audit logs</div>
                    <div className="empty-state-text">No security audit logs have been recorded.</div>
                </div>
            ) : (
                <div className="timeline" style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "relative", paddingLeft: "1.5rem", borderLeft: "2px solid rgba(255,255,255,0.06)", marginLeft: "0.5rem" }}>
                    {logs.map(log => (
                        <div key={log._id} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                            {/* Timeline Dot */}
                            <div style={{ position: "absolute", left: "-29px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--role-accent)", border: "2px solid var(--background-dark)" }}></div>
                            
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span className="badge" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "600", padding: "0.2rem 0.5rem" }}>
                                    {log.action}
                                </span>
                                <span style={{ color: "var(--text-muted)", fontSize: "0.8rem" }}>
                                    {new Date(log.createdAt).toLocaleString()}
                                </span>
                            </div>
                            <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.1rem" }}>{log.details}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                                <span>Performed By: <strong style={{ color: "var(--text-main)" }}>{log.performerId?.name || "System"}</strong> ({log.performerId?.role || "System"})</span>
                                <span style={{ opacity: 0.5 }}>•</span>
                                <span>IP Address: {log.ipAddress}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Admin;

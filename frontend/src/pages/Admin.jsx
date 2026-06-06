import React, { useState, useEffect, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Admin = () => {
    const { user } = useContext(AuthContext);
    const [searchParams, setSearchParams] = useSearchParams();
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
        loadCoreData();
    }, [activeTab]);

    if (loading) return <div className="text-center">Loading Admin Panel Data...</div>;

    return (
        <div>
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
                <h1 className="page-title">University Admin Console</h1>
                <p style={{ color: "var(--text-muted)", margin: 0 }}>
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

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/users?role=${roleFilter}&search=${search}`);
            setUsers(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, search]);

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
            alert("Delete failed");
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
            <div className="glass-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h3>User Accounts Registry</h3>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button onClick={() => setRoleFilter("student")} className={`btn ${roleFilter === "student" ? "btn-primary" : "btn-outline"}`} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Students</button>
                        <button onClick={() => setRoleFilter("lecturer")} className={`btn ${roleFilter === "lecturer" ? "btn-primary" : "btn-outline"}`} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Lecturers</button>
                    </div>
                </div>

                {/* Temporary Password Banner */}
                {createdTempPassword && (
                    <div className="alert alert-success" style={{ background: "rgba(46, 204, 113, 0.2)", border: "1px solid var(--success)", padding: "1.2rem", borderRadius: "8px", marginBottom: "1.5rem", position: "relative" }}>
                        <h4 style={{ color: "#2ecc71", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.95rem" }}>
                            🔑 Temporary Password Generated
                        </h4>
                        <p style={{ margin: "0 0 0.8rem 0", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Copy the password below. The user is required to change this upon their first login to gain access.
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", background: "rgba(0,0,0,0.3)", padding: "0.5rem 0.8rem", borderRadius: "6px", border: "1px solid var(--border-color)", width: "fit-content" }}>
                            <span style={{ fontFamily: "monospace", fontSize: "1.1rem", fontWeight: "bold", color: "#fff", letterSpacing: "1px" }}>{createdTempPassword}</span>
                            <button 
                                onClick={() => {
                                    navigator.clipboard.writeText(createdTempPassword);
                                    alert("Password copied to clipboard!");
                                }} 
                                className="btn btn-outline" 
                                style={{ padding: "0.2rem 0.4rem", fontSize: "0.75rem" }}
                            >
                                Copy
                            </button>
                        </div>
                        <button 
                            onClick={() => setCreatedTempPassword("")} 
                            style={{ position: "absolute", top: "0.8rem", right: "0.8rem", background: "none", border: "none", color: "#fff", fontSize: "1.1rem", cursor: "pointer" }}
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div style={{ marginBottom: "1.5rem" }}>
                    <input type="text" className="form-input" placeholder="🔍 Search users by name, email, or registration ID..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                {loading ? <p>Loading users...</p> : users.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No accounts found.</p> : (
                    <div className="table-responsive">
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
                                        <td>{u.registrationNumber || (u.role === "student" ? u.studentId : u.lecturerId) || "N/A"}</td>
                                        <td>{u.name}</td>
                                        <td>{u.email}</td>
                                        <td>{u.department || u.departmentId?.code || "None"}</td>
                                        <td>
                                            <span 
                                                className="badge" 
                                                style={{ 
                                                    display: "inline-block", 
                                                    padding: "0.2rem 0.5rem", 
                                                    borderRadius: "4px", 
                                                    fontSize: "0.7rem", 
                                                    fontWeight: "600",
                                                    background: u.isActive !== false ? "rgba(46, 204, 113, 0.15)" : "rgba(231, 76, 60, 0.15)", 
                                                    color: u.isActive !== false ? "#2ecc71" : "#e74c3c", 
                                                    border: u.isActive !== false ? "1px solid rgba(46, 204, 113, 0.3)" : "1px solid rgba(231, 76, 60, 0.3)"
                                                }}
                                            >
                                                {u.isActive !== false ? "Active" : "Suspended"}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.3rem" }}>
                                                <button 
                                                    onClick={() => handleToggleStatus(u._id, u.isActive !== false)} 
                                                    className="btn btn-outline" 
                                                    style={{ 
                                                        padding: "0.25rem 0.4rem", 
                                                        fontSize: "0.7rem", 
                                                        borderColor: u.isActive !== false ? "#e74c3c" : "#2ecc71", 
                                                        color: u.isActive !== false ? "#e74c3c" : "#2ecc71" 
                                                    }}
                                                >
                                                    {u.isActive !== false ? "Suspend" : "Activate"}
                                                </button>
                                                <button 
                                                    onClick={() => handleResetPassword(u._id, u.email)} 
                                                    className="btn btn-outline" 
                                                    style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem" }}
                                                >
                                                    Reset
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteUser(u._id)} 
                                                    className="btn btn-danger" 
                                                    style={{ padding: "0.25rem 0.4rem", fontSize: "0.7rem" }}
                                                >
                                                    Delete
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

            <div className="glass-card">
                <h3>Create User Account</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleCreateUser} style={{ marginTop: "1rem" }}>
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
                        <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                            <option value="student">Student</option>
                            <option value="lecturer">Lecturer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Department (Optional)</label>
                        <select className="form-input" value={department} onChange={e => setDepartment(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                            <option value="">None</option>
                            {departments.map(d => (
                                <option key={d._id} value={d.name}>{d.code} - {d.name}</option>
                            ))}
                        </select>
                    </div>

                    {role === "lecturer" && (
                        <div className="form-group">
                            <label>Specialization Field</label>
                            <input type="text" className="form-input" placeholder="e.g. Theoretical Physics" value={specialization} onChange={e => setSpecialization(e.target.value)} />
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Create Account</button>
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

    const fetchCourses = async () => {
        setLoading(true);
        try {
            const res = await api.get("/courses");
            setCourses(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

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
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
            <div className="glass-card">
                <h3>Course Catalog Registry</h3>
                {loading ? <p>Loading catalog...</p> : courses.length === 0 ? <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No courses registered.</p> : (
                    <div className="table-responsive" style={{ marginTop: "1rem" }}>
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
                                        <td><strong>{c.code}</strong></td>
                                        <td>{c.name}</td>
                                        <td>{c.departmentId?.code}</td>
                                        <td>
                                            <select 
                                                value={c.lecturerId?._id || ""} 
                                                onChange={e => handleAssignLecturer(c._id, e.target.value)}
                                                style={{ background: "var(--bg-dark)", color: "var(--text-main)", border: "1px solid var(--border-color)", padding: "0.2rem", borderRadius: "4px" }}
                                            >
                                                <option value="">Unassigned</option>
                                                {lecturers.map(l => (
                                                    <option key={l._id} value={l._id}>{l.name}</option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => handleDeleteCourse(c._id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="glass-card">
                <h3>Create New Course Section</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleCreateCourse} style={{ marginTop: "1rem" }}>
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
                        <select className="form-input" value={departmentId} onChange={e => setDepartmentId(e.target.value)} style={{ background: "var(--bg-dark)" }} required>
                            <option value="">Select Department</option>
                            {departments.map(d => (
                                <option key={d._id} value={d._id}>{d.code} - {d.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assign Initial Lecturer (Optional)</label>
                        <select className="form-input" value={lecturerId} onChange={e => setLecturerId(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                            <option value="">Unassigned</option>
                            {lecturers.map(l => (
                                <option key={l._id} value={l._id}>{l.name}</option>
                            ))}
                        </select>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>Create Course</button>
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

    const fetchRequests = async () => {
        setLoading(true);
        try {
            const res = await api.get("/enrollments?status=pending");
            setRequests(res.data.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

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
            alert("Action failed");
        }
    };

    return (
        <div className="glass-card">
            <h3>Pending Enrollment Requests</h3>
            {loading ? <p>Loading requests...</p> : requests.length === 0 ? <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No pending enrollment approvals needed. 🍃</p> : (
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
                                    <td>{r.studentId?.studentId}</td>
                                    <td>{r.studentId?.name}</td>
                                    <td><strong>{r.courseId?.code}</strong></td>
                                    <td>{r.courseId?.name}</td>
                                    <td>{r.semester}</td>
                                    <td>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button onClick={() => handleApproval(r._id, true)} className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Approve</button>
                                            <button onClick={() => handleApproval(r._id, false)} className="btn btn-danger" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Reject</button>
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
            alert("Delete failed");
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
            
            {/* List and CRUD forms */}
            <div className="glass-card">
                <h3>Departments & Academic Units</h3>
                {departments.length === 0 ? <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No departments created.</p> : (
                    <div className="table-responsive" style={{ marginTop: "1.5rem" }}>
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
                                        <td><strong>{d.code}</strong></td>
                                        <td>{d.name}</td>
                                        <td>{d.facultyId?.name}</td>
                                        <td>
                                            <button onClick={() => handleDeleteDept(d._id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>Delete</button>
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
                <div className="glass-card">
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
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>Create Faculty</button>
                    </form>
                </div>

                {/* Department Creator */}
                <div className="glass-card">
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
                            <select className="form-input" value={facultyId} onChange={e => setFacultyId(e.target.value)} style={{ background: "var(--bg-dark)" }} required>
                                <option value="">Select Faculty</option>
                                {faculties.map(f => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "0.5rem" }}>Create Department</button>
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

    if (loading) return <p>Loading audit trails...</p>;

    return (
        <div className="glass-card">
            <h3>System Activity Audit Trails</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
                Displays chronological records of user authentication actions, enrollment changes, course catalog CRUDs, and security events.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {logs.length === 0 ? <p style={{ color: "var(--text-muted)" }}>No logs recorded yet.</p> : logs.map(log => (
                    <div key={log._id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <span className="badge" style={{ background: "rgba(255,255,255,0.05)", marginRight: "1rem" }}>{log.action}</span>
                            <span>{log.details}</span>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                Performed By: {log.performerId?.name || "System"} ({log.performerId?.role || "System"}) • IP Address: {log.ipAddress}
                            </div>
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            {new Date(log.createdAt).toLocaleString()}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Admin;

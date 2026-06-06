import { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [activeTab, setActiveTab] = useState("materials");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg] = useState(null);

    // Tab specific states
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState({ percentage: 100, data: [] });
    const [forumThreads, setForumThreads] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const fetchCourseDetails = useCallback(async () => {
        try {
            const res = await api.get(`/courses/${id}`);
            setCourse(res.data.data.course);
            setEnrolledStudents(res.data.data.enrolledStudents);
            setMaterials(res.data.data.course.materials || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    }, [id]);

    const fetchTabData = useCallback(async () => {
        if (!course) return;
        try {
            if (activeTab === "assignments") {
                const res = await api.get(`/assignments/course/${id}`);
                setAssignments(res.data.data);
            } else if (activeTab === "quizzes") {
                const res = await api.get(`/quizzes/course/${id}`);
                setQuizzes(res.data.data);
            } else if (activeTab === "attendance") {
                if (user.role === "student") {
                    const res = await api.get(`/attendance/course/${id}`);
                    setStudentAttendance(res.data);
                } else {
                    const res = await api.get(`/attendance/course/${id}/stats`);
                    setAttendanceStats(res.data.data);
                }
            } else if (activeTab === "forum") {
                const res = await api.get(`/forums/course/${id}`);
                setForumThreads(res.data.data);
            } else if (activeTab === "announcements") {
                const res = await api.get(`/announcements/course/${id}`);
                setAnnouncements(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load tab data:", err);
        }
    }, [course, activeTab, id, user]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchCourseDetails();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchCourseDetails]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTabData();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchTabData]);

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: "60vh" }}>
                <div className="spinner"></div>
                <p className="loading-text">Loading course workspace...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: "3rem 0", maxWidth: "600px" }}>
                <div className="glass-card-static">
                    <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>{error}</div>
                    <button onClick={() => navigate("/courses")} className="btn btn-outline" style={{ width: "100%" }}>
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="container" style={{ padding: "3rem 0", maxWidth: "600px" }}>
                <div className="glass-card-static">
                    <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>Course not found.</div>
                    <button onClick={() => navigate("/courses")} className="btn btn-outline" style={{ width: "100%" }}>
                        Back to Courses
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            {/* Header Banner */}
            <div className="course-header-banner animate-slide-up stagger-1">
                <div className="course-header-content">
                    <span className="course-card-code">{course.code}</span>
                    <h1 style={{ marginTop: "0.75rem", marginBottom: "0.5rem" }}>{course.name}</h1>
                    <p className="course-card-desc" style={{ color: "rgba(255,255,255,0.7)", margin: "0 0 1.5rem 0", fontSize: "0.95rem", lineHeight: "1.5" }}>{course.description}</p>
                    <div className="course-meta-row" style={{ display: "flex", gap: "1.5rem 2.5rem", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", flexWrap: "wrap" }}>
                        <div className="course-meta-item" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "15px", height: "15px" }}>
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                                <line x1="9" y1="22" x2="9" y2="16"/>
                                <line x1="15" y1="22" x2="15" y2="16"/>
                            </svg>
                            <span><strong>Department:</strong> {course.departmentId?.name}</span>
                        </div>
                        <div className="course-meta-item" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "15px", height: "15px" }}>
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            <span><strong>Lecturer:</strong> {course.lecturerId?.name || "Not Assigned"}</span>
                        </div>
                        <div className="course-meta-item" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "15px", height: "15px" }}>
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                            </svg>
                            <span><strong>Credits:</strong> {course.credits} Credits</span>
                        </div>
                        <div className="course-meta-item" style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "15px", height: "15px" }}>
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            <span><strong>Semester:</strong> {course.semester}</span>
                        </div>
                    </div>
                </div>
            </div>

            {successMsg && <div className="alert alert-success animate-fade-in">{successMsg}</div>}

            {/* Navigation Tabs */}
            <div className="tabs-header animate-slide-up stagger-2" style={{ overflowX: "auto" }}>
                <button className={`tab-btn ${activeTab === "materials" ? "active" : ""}`} onClick={() => setActiveTab("materials")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                    </svg>
                    <span>Materials</span>
                </button>
                <button className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`} onClick={() => setActiveTab("assignments")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    </svg>
                    <span>Assignments</span>
                </button>
                <button className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`} onClick={() => setActiveTab("quizzes")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    <span>Quizzes</span>
                </button>
                <button className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Attendance</span>
                </button>
                <button className={`tab-btn ${activeTab === "forum" ? "active" : ""}`} onClick={() => setActiveTab("forum")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Forum</span>
                </button>
                <button className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`} onClick={() => setActiveTab("announcements")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <span>Announcements</span>
                </button>
            </div>

            {/* Tab contents */}
            <div className="tab-pane animate-slide-up stagger-3" style={{ padding: "1.5rem 0" }}>
                {activeTab === "materials" && (
                    <MaterialsTab 
                        materials={materials} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchCourseDetails} 
                    />
                )}
                {activeTab === "assignments" && (
                    <AssignmentsTab 
                        assignments={assignments} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "quizzes" && (
                    <QuizzesTab 
                        quizzes={quizzes} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "attendance" && (
                    <AttendanceTab 
                        attendanceStats={attendanceStats} 
                        studentAttendance={studentAttendance}
                        courseId={id} 
                        user={user} 
                        enrolledStudents={enrolledStudents}
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "forum" && (
                    <ForumTab 
                        threads={forumThreads} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "announcements" && (
                    <AnnouncementsTab 
                        announcements={announcements} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
            </div>
        </div>
    );
};

// ==========================================================================
// 1. MATERIALS TAB COMPONENT
// ==========================================================================
const MaterialsTab = ({ materials, courseId, user, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [fileType, setFileType] = useState("pdf");
    const [file, setFile] = useState(null);
    const [externalUrl, setExternalUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title) return setError("Please add a title");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("fileType", fileType);

        if (fileType === "link") {
            if (!externalUrl) return setError("Please add an external url");
            formData.append("externalUrl", externalUrl);
        } else {
            if (!file) return setError("Please select a file to upload");
            formData.append("materialFile", file);
        }

        setUploading(true);
        try {
            await api.post(`/courses/${courseId}/materials`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setFile(null);
            setExternalUrl("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (matId) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await api.delete(`/courses/${courseId}/materials/${matId}`);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.4fr 1fr" : "1fr", gap: "2rem" }}>
            <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                <h3>Learning Materials</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.85rem", lineHeight: "1.4" }}>
                    Access learning guides, lecture PPTs, PDF manuals, links, and syllabus files.
                </p>

                {materials.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">No materials found</div>
                        <div className="empty-state-text">No study materials have been uploaded to this section yet.</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                        {materials.map(mat => (
                            <div key={mat._id} className="glass-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <div style={{ fontSize: "1.5rem", color: "var(--primary-400)" }}>
                                        {mat.fileType === "pdf" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "28px", height: "28px" }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                        ) : mat.fileType === "word" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "28px", height: "28px" }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                                            </svg>
                                        ) : mat.fileType === "powerpoint" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "28px", height: "28px" }}>
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                                            </svg>
                                        ) : mat.fileType === "video" ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "28px", height: "28px" }}>
                                                <polygon points="23 7 16 12 23 17 23 7"/>
                                                <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                                            </svg>
                                        ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "28px", height: "28px" }}>
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                            </svg>
                                        )}
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{mat.title}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                            Type: {mat.fileType.toUpperCase()} • Uploaded: {new Date(mat.uploadedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <a 
                                        href={mat.fileType === "link" ? mat.fileUrl : `http://localhost:5000${mat.fileUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-outline btn-sm"
                                        style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", textDecoration: "none" }}
                                    >
                                        <span>Open</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                            <polyline points="15 3 21 3 21 9"/>
                                            <line x1="10" y1="14" x2="21" y2="3"/>
                                        </svg>
                                    </a>
                                    {user.role !== "student" && (
                                        <button 
                                            onClick={() => handleDelete(mat._id)} 
                                            className="btn-icon"
                                            title="Delete Material"
                                            style={{ color: "var(--error)", background: "rgba(255,255,255,0.02)" }}
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <polyline points="3 6 5 6 21 6"/>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user.role !== "student" && (
                <div className="glass-card-static" style={{ height: "fit-content" }}>
                    <h3>Upload New Material</h3>
                    {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}

                    <form onSubmit={handleUpload} style={{ marginTop: "1.25rem" }}>
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-input" placeholder="e.g. Lecture 1 Notes" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Material Type</label>
                            <select className="form-input" value={fileType} onChange={e => setFileType(e.target.value)} style={{ background: "var(--background-dark)" }}>
                                <option value="pdf">PDF Document</option>
                                <option value="word">Word Document</option>
                                <option value="powerpoint">PowerPoint Presentation</option>
                                <option value="video">MP4 Video Lecture</option>
                                <option value="link">External URL Link</option>
                            </select>
                        </div>

                        {fileType === "link" ? (
                            <div className="form-group animate-slide-down">
                                <label>External URL</label>
                                <input type="url" className="form-input" placeholder="https://example.com" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} required />
                            </div>
                        ) : (
                            <div className="form-group animate-slide-down">
                                <label>Select File</label>
                                <input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: "var(--text-muted)", marginTop: "0.25rem" }} required />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={uploading} style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>
                            {uploading ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                    <span>Uploading...</span>
                                </div>
                            ) : "Upload Material"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 2. ASSIGNMENTS TAB COMPONENT
// ==========================================================================
const AssignmentsTab = ({ assignments, courseId, user, onUpdate }) => {
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);

    // Create Assignment States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maxMarks, setMaxMarks] = useState(100);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Student Submit Work States
    const [submitFile, setSubmitFile] = useState(null);
    const [submitComments, setSubmitComments] = useState("");
    const [uploadingSubmit, setUploadingSubmit] = useState(false);

    // Lecturer Grading States
    const [gradingSubId, setGradingSubId] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");

    const loadAssignmentDetails = async (assId) => {
        try {
            const res = await api.get(`/assignments/${assId}`);
            setSelectedAssignment(res.data.data.assignment);
            if (user.role === "student") {
                setMySubmission(res.data.data.mySubmission);
            } else {
                setSubmissions(res.data.data.submissions);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !description || !dueDate) return setError("Please fill in all required fields");

        setSubmitting(true);
        const formData = new FormData();
        formData.append("courseId", courseId);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("dueDate", dueDate);
        formData.append("maxMarks", maxMarks);
        if (file) formData.append("assignmentFile", file);

        try {
            await api.post("/assignments", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setDescription("");
            setDueDate("");
            setFile(null);
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (!submitFile) return alert("Please select a file to submit");

        setUploadingSubmit(true);
        const formData = new FormData();
        formData.append("submissionFile", submitFile);
        formData.append("comments", submitComments);

        try {
            await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Assignment submitted successfully!");
            setSubmitFile(null);
            setSubmitComments("");
            loadAssignmentDetails(selectedAssignment._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit assignment");
        } finally {
            setUploadingSubmit(false);
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        if (grade === "") return alert("Please specify a grade");

        try {
            await api.put(`/assignments/submission/${gradingSubId}/grade`, { grade, feedback });
            alert("Submission graded successfully!");
            setGrade("");
            setFeedback("");
            setGradingSubId(null);
            loadAssignmentDetails(selectedAssignment._id);
        } catch (err) {
            alert(err.response?.data?.message || "Grading failed");
        } finally {
            setGradingSubId(null);
        }
    };

    // Calculate urgency for deadlines
    const isOverdue = (dueDateStr) => {
        return new Date(dueDateStr) < new Date();
    };

    return (
        <div>
            {selectedAssignment ? (
                // DETAIL WORKSPACE FOR SELECTED ASSIGNMENT
                <div className="glass-card-static animate-scale-in">
                    <button 
                        onClick={() => setSelectedAssignment(null)} 
                        className="btn btn-outline btn-sm" 
                        style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Back to Assignments List</span>
                    </button>

                    <h2 style={{ marginBottom: "0.5rem" }}>{selectedAssignment.title}</h2>
                    <p style={{ margin: "1rem 0", lineHeight: "1.5", color: "var(--text-main)" }}>{selectedAssignment.description}</p>
                    
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span className={`badge ${isOverdue(selectedAssignment.dueDate) ? "badge-danger" : "badge-student"}`} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: "600" }}>
                            Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}
                        </span>
                        <span className="badge" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-main)" }}>
                            Max Marks: {selectedAssignment.maxMarks}
                        </span>
                        {selectedAssignment.fileUrl && (
                            <a 
                                href={`http://localhost:5000${selectedAssignment.fileUrl}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="link-alt"
                                style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "600" }}
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                                <span>Download Guidelines</span>
                            </a>
                        )}
                    </div>

                    {user.role === "student" ? (
                        // STUDENT VIEW: SHOW MY SUBMISSION STATUS & FORM
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>My Submission State</h3>
                            {mySubmission ? (
                                <div className="glass-card-inner" style={{ padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", marginTop: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                        <span>Status: <strong className={`badge badge-${mySubmission.status === "graded" ? "success" : "student"}`} style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem", fontWeight: "700", marginLeft: "0.5rem" }}>{mySubmission.status.toUpperCase()}</strong></span>
                                        <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Submitted: {new Date(mySubmission.submittedAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <strong>Submission Attachment:</strong>{" "}
                                        <a href={`http://localhost:5000${mySubmission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="link-alt" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                                <polyline points="14 2 14 8 20 8"/>
                                            </svg>
                                            <span>View Submitted Document</span>
                                        </a>
                                    </div>
                                    {mySubmission.comments && <p style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}><strong>My Comments:</strong> {mySubmission.comments}</p>}

                                    {mySubmission.status === "graded" && (
                                        <div className="glass-card-inner" style={{ marginTop: "1.5rem", borderLeft: "3px solid var(--success)", padding: "1rem", borderRadius: "8px", background: "rgba(16, 185, 129, 0.04)" }}>
                                            <h4 style={{ color: "var(--success)", marginBottom: "0.5rem" }}>Lecturer Evaluation Result</h4>
                                            <div style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}><strong>Score:</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>{mySubmission.grade}</span> / {selectedAssignment.maxMarks}</div>
                                            {mySubmission.feedback && <div style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}><strong>Feedback:</strong> {mySubmission.feedback}</div>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleStudentSubmit} style={{ maxWidth: "500px", marginTop: "1rem" }}>
                                    <div className="form-group">
                                        <label>Select Submission File (PDF, DOCX, ZIP etc.)</label>
                                        <input type="file" onChange={e => setSubmitFile(e.target.files[0])} style={{ color: "var(--text-muted)", marginTop: "0.25rem" }} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Comments / Text Answer (Optional)</label>
                                        <textarea className="form-input" rows="3" placeholder="Write any notes to your lecturer..." value={submitComments} onChange={e => setSubmitComments(e.target.value)}></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={uploadingSubmit} style={{ width: "100%", justifyContent: "center" }}>
                                        {uploadingSubmit ? (
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                                <span>Uploading submission...</span>
                                            </div>
                                        ) : "Submit Assignment"}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        // LECTURER VIEW: SHOW ALL SUBMISSIONS AND GRADING PORTAL
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>Student Submissions List</h3>
                            
                            {submissions.length === 0 ? (
                                <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                                    <div className="empty-state-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                    </div>
                                    <div className="empty-state-title">No submissions yet</div>
                                    <div className="empty-state-text">No student has submitted work for this assignment yet.</div>
                                </div>
                            ) : (
                                <div className="table-responsive" style={{ marginTop: "1rem" }}>
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Student Name</th>
                                                <th>Submitted At</th>
                                                <th>Status</th>
                                                <th>Grade</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map(sub => (
                                                <tr key={sub._id}>
                                                    <td><strong>{sub.studentId?.studentId}</strong></td>
                                                    <td>{sub.studentId?.name}</td>
                                                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                                    <td>
                                                        <span className={`badge badge-${sub.status === "graded" ? "success" : sub.status === "late" ? "danger" : "student"}`} style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {sub.grade !== null ? (
                                                            <strong>{sub.grade} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "normal" }}>/ {selectedAssignment.maxMarks}</span></strong>
                                                        ) : (
                                                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Not Graded</span>
                                                        )}
                                                    </td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                                            <a 
                                                                href={`http://localhost:5000${sub.fileUrl}`} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer" 
                                                                className="btn-icon" 
                                                                title="Download Submission File"
                                                                style={{ color: "var(--primary-400)", background: "rgba(255,255,255,0.02)" }}
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                                                </svg>
                                                            </a>
                                                            <button 
                                                                onClick={() => { setGradingSubId(sub._id); setGrade(sub.grade || ""); setFeedback(sub.feedback || ""); }} 
                                                                className="btn btn-primary btn-sm"
                                                                style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.2rem" }}
                                                            >
                                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "12px", height: "12px" }}>
                                                                    <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                                                </svg>
                                                                <span>Grade</span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Grading form */}
                            {gradingSubId && (
                                <div className="glass-card-static animate-scale-in" style={{ marginTop: "2rem", maxWidth: "500px" }}>
                                    <h4>Grade Student Work</h4>
                                    <form onSubmit={handleGradeSubmission} style={{ marginTop: "1rem" }}>
                                        <div className="form-group">
                                            <label>Marks (out of {selectedAssignment.maxMarks})</label>
                                            <input type="number" className="form-input" max={selectedAssignment.maxMarks} min={0} value={grade} onChange={e => setGrade(e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Written Feedback</label>
                                            <textarea className="form-input" rows="3" placeholder="Provide constructive criticism..." value={feedback} onChange={e => setFeedback(e.target.value)}></textarea>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button type="submit" className="btn btn-primary btn-sm">Save Grade</button>
                                            <button type="button" onClick={() => setGradingSubId(null)} className="btn btn-outline btn-sm">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // ASSIGNMENTS LIST VIEW
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.4fr 1fr" : "1fr", gap: "2rem" }}>
                    <div className="glass-card-static animate-fade-in" style={{ display: "flex", flexDirection: "column" }}>
                        <h3>Assignments List</h3>
                        {assignments.length === 0 ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No assignments posted</div>
                                <div className="empty-state-text">No assignments have been assigned to this section yet.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", flex: 1 }}>
                                {assignments.map(ass => (
                                    <div key={ass._id} className="glass-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                        <div>
                                            <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{ass.title}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                <span className={isOverdue(ass.dueDate) ? "badge badge-danger" : "badge badge-student"} style={{ fontSize: "0.65rem" }}>Due: {new Date(ass.dueDate).toLocaleDateString()}</span>
                                                <span className="badge" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", fontSize: "0.65rem", color: "var(--text-main)" }}>Points: {ass.maxMarks}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => loadAssignmentDetails(ass._id)} className="btn btn-primary btn-sm" style={{ padding: "0.45rem 1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span>Open</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                <polyline points="9 18 15 12 9 6"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user.role !== "student" && (
                        <div className="glass-card-static" style={{ height: "fit-content" }}>
                            <h3>Create New Assignment</h3>
                            {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}

                            <form onSubmit={handleCreateAssignment} style={{ marginTop: "1.25rem" }}>
                                <div className="form-group">
                                    <label>Assignment Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Midterm Essay" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Detailed Description</label>
                                    <textarea className="form-input" rows="4" placeholder="Specify instructions..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Due Date & Time</label>
                                    <input type="datetime-local" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Maximum Marks Available</label>
                                    <input type="number" className="form-input" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Guideline File Attachment (Optional)</label>
                                    <input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: "var(--text-muted)", marginTop: "0.25rem" }} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>
                                    {submitting ? (
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                            <span>Posting...</span>
                                        </div>
                                    ) : "Post Assignment"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 3. QUIZZES TAB COMPONENT
// ==========================================================================
const QuizzesTab = ({ quizzes, courseId, user, onUpdate }) => {
    const navigate = useNavigate();

    // Create Quiz States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Selected Quiz Configuration States
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);

    // Question form builder states
    const [qText, setQText] = useState("");
    const [qType, setQType] = useState("mcq");
    const [qOptions, setQOptions] = useState(["", "", "", ""]);
    const [qAnswer, setQAnswer] = useState("0");
    const [qPoints, setQPoints] = useState(5);

    const loadQuizDetails = async (quizId) => {
        try {
            const [questionsRes, resultsRes] = await Promise.all([
                api.post(`/quizzes/${quizId}/attempt`), // Fetch questions safely
                api.get(`/quizzes/${quizId}/results`) // Fetch results list
            ]);
            setSelectedQuiz(quizzes.find(q => q._id === quizId));
            setQuestions(questionsRes.data.data.questions);
            setResults(resultsRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!title || !dueDate) return setError("Please fill in required fields");

        try {
            await api.post("/quizzes", {
                courseId,
                title,
                description,
                durationMinutes: duration,
                dueDate
            });
            setSuccess("Quiz shell created successfully!");
            setTitle("");
            setDescription("");
            setDueDate("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create quiz");
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!qText) return alert("Question text required");

        let payload = {
            text: qText,
            type: qType,
            points: qPoints,
            correctAnswer: qAnswer
        };

        if (qType === "mcq") {
            payload.options = qOptions;
        } else if (qType === "true_false") {
            payload.correctAnswer = qAnswer; // "true" or "false"
        }

        try {
            await api.post(`/quizzes/${selectedQuiz._id}/questions`, {
                questions: [payload]
            });
            alert("Question added!");
            setQText("");
            setQOptions(["", "", "", ""]);
            loadQuizDetails(selectedQuiz._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add question");
        }
    };

    const isOverdue = (dueDateStr) => {
        return new Date(dueDateStr) < new Date();
    };

    return (
        <div>
            {selectedQuiz ? (
                // SELECTED QUIZ SETUP/RESULTS PORTAL
                <div className="glass-card-static animate-scale-in">
                    <button 
                        onClick={() => setSelectedQuiz(null)} 
                        className="btn btn-outline btn-sm" 
                        style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Back to Quizzes List</span>
                    </button>
                    <h2>{selectedQuiz.title}</h2>
                    <p style={{ margin: "1rem 0", lineHeight: "1.5", color: "var(--text-main)" }}>{selectedQuiz.description}</p>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
                        <span className="badge" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid var(--border-color)", padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: "600", color: "var(--text-main)" }}>
                            ⏱ Duration: {selectedQuiz.durationMinutes} minutes
                        </span>
                        <span className={`badge ${isOverdue(selectedQuiz.dueDate) ? "badge-danger" : "badge-student"}`} style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", fontWeight: "600" }}>
                            Due Date: {new Date(selectedQuiz.dueDate).toLocaleString()}
                        </span>
                    </div>

                    {user.role !== "student" ? (
                        // LECTURER VIEW: EDIT QUESTIONS & ROSTER RESULTS
                        <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            
                            <div>
                                <h3>Quiz Questions ({questions.length})</h3>
                                {questions.length === 0 ? (
                                    <div className="empty-state animate-fade-in" style={{ padding: "3rem 1rem", border: "1px dashed var(--border-color)" }}>
                                        <div className="empty-state-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                        </div>
                                        <div className="empty-state-title">No questions added</div>
                                        <div className="empty-state-text">Build this exam by adding questions in the builder panel.</div>
                                    </div>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                                        {questions.map((q, idx) => (
                                            <div key={q._id} className="glass-card-inner" style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                                                    <strong>{idx + 1}. {q.text}</strong>
                                                    <span className="badge badge-student" style={{ fontSize: "0.7rem", fontWeight: "700" }}>{q.points} pts</span>
                                                </div>
                                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Type: {q.type.toUpperCase()}</div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h3 style={{ marginTop: "2.5rem", marginBottom: "1rem" }}>Student Submissions Results</h3>
                                {results.length === 0 ? (
                                    <div className="empty-state" style={{ padding: "3rem 1rem", border: "1px dashed var(--border-color)" }}>
                                        <div className="empty-state-icon">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <line x1="12" y1="8" x2="12" y2="12"/>
                                                <line x1="12" y1="16" x2="12.01" y2="16"/>
                                            </svg>
                                        </div>
                                        <div className="empty-state-title">No attempts yet</div>
                                        <div className="empty-state-text">No student attempts recorded for this quiz yet.</div>
                                    </div>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="premium-table">
                                            <thead>
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Name</th>
                                                    <th>Score Obtained</th>
                                                    <th>Evaluation Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map(res => (
                                                    <tr key={res._id}>
                                                        <td><strong>{res.studentId?.studentId}</strong></td>
                                                        <td>{res.studentId?.name}</td>
                                                        <td><strong>{res.score}</strong> / {res.totalMarks}</td>
                                                        <td>
                                                            <span className={`badge badge-${res.graded ? "success" : "warning"}`} style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                                                                {res.graded ? "Graded" : "Needs Grading (Short Answer)"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* ADD QUESTION FORM BUILDER */}
                            <div className="glass-card-static" style={{ background: "rgba(0,0,0,0.15)", height: "fit-content" }}>
                                <h3>Add Question</h3>
                                <form onSubmit={handleAddQuestion} style={{ marginTop: "1.25rem" }}>
                                    <div className="form-group">
                                        <label>Question Type</label>
                                        <select className="form-input" value={qType} onChange={e => { setQType(e.target.value); setQAnswer(e.target.value === "true_false" ? "true" : "0"); }} style={{ background: "var(--background-dark)" }}>
                                            <option value="mcq">Multiple Choice Question (MCQ)</option>
                                            <option value="true_false">True / False</option>
                                            <option value="short_answer">Short / Written Answer</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Question Content</label>
                                        <textarea className="form-input" rows="3" placeholder="Enter question description..." value={qText} onChange={e => setQText(e.target.value)} required></textarea>
                                    </div>

                                    {qType === "mcq" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }} className="animate-slide-down">
                                            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>MCQ Choices</label>
                                            {qOptions.map((opt, i) => (
                                                <input key={i} type="text" className="form-input" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                                                    const copy = [...qOptions];
                                                    copy[i] = e.target.value;
                                                    setQOptions(copy);
                                                }} required />
                                            ))}
                                            <div className="form-group" style={{ marginTop: "0.75rem" }}>
                                                <label>Correct Choice index</label>
                                                <select className="form-input" value={qAnswer} onChange={e => setQAnswer(e.target.value)} style={{ background: "var(--background-dark)" }}>
                                                    <option value="0">Choice 1</option>
                                                    <option value="1">Choice 2</option>
                                                    <option value="2">Choice 3</option>
                                                    <option value="3">Choice 4</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {qType === "true_false" && (
                                        <div className="form-group animate-slide-down">
                                            <label>Correct Answer Key</label>
                                            <select className="form-input" value={qAnswer} onChange={e => setQAnswer(e.target.value)} style={{ background: "var(--background-dark)" }}>
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        </div>
                                    )}

                                    {qType === "short_answer" && (
                                        <div className="form-group animate-slide-down">
                                            <label>Grading Rubric Key / Expected Keywords</label>
                                            <input type="text" className="form-input" placeholder="e.g. key terms to look for..." value={qAnswer} onChange={e => setQAnswer(e.target.value)} required />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Weight Points</label>
                                        <input type="number" className="form-input" value={qPoints} onChange={e => setQPoints(parseInt(e.target.value))} required />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }}>
                                        Add to Quiz
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        // STUDENT VIEW: CHECK FOR ATTEMPT LOGS OR OPEN TIMED INTERFACE
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>My Attempt Roster</h3>
                            {results.length > 0 ? (
                                <div className="glass-card-inner" style={{ borderLeft: "3px solid var(--success)", padding: "1.5rem", borderRadius: "12px", marginTop: "1rem", maxWidth: "500px", background: "rgba(16, 185, 129, 0.04)" }}>
                                    <h4 style={{ color: "var(--success)", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "18px", height: "18px" }}>
                                            <polyline points="20 6 9 17 4 12"/>
                                        </svg>
                                        Quiz Attempted successfully!
                                    </h4>
                                    <div style={{ margin: "1rem 0", lineHeight: "1.6" }}>
                                        <strong>Grading State:</strong> <span className={`badge badge-${results[0].graded ? "success" : "warning"}`} style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem" }}>{results[0].graded ? "Evaluated" : "Pending Manual Grading"}</span> <br />
                                        <div style={{ fontSize: "1.1rem", marginTop: "0.5rem" }}><strong>Final Score:</strong> <span style={{ color: "var(--success)", fontWeight: "700" }}>{results[0].score}</span> / {results[0].totalMarks}</div>
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", borderTop: "1px dashed rgba(255,255,255,0.06)", paddingTop: "0.5rem" }}>
                                        Submitted: {new Date(results[0].createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ) : (
                                <div className="empty-state" style={{ padding: "3rem 1rem", border: "1px dashed var(--border-color)", maxWidth: "600px", marginTop: "1rem" }}>
                                    <div className="empty-state-icon" style={{ color: "var(--warning)" }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                    </div>
                                    <div className="empty-state-title">Quiz not attempted yet</div>
                                    <div className="empty-state-text" style={{ marginBottom: "1.5rem" }}>This is a timed quiz session. Once loaded, the countdown timer starts immediately.</div>
                                    <button onClick={() => navigate(`/courses/${courseId}/quizzes/${selectedQuiz._id}`)} className="btn btn-primary" style={{ padding: "0.6rem 2rem", display: "inline-flex", alignItems: "center", gap: "0.4rem" }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}>
                                            <polygon points="5 3 19 12 5 21 5 3"/>
                                        </svg>
                                        <span>Start Timed Quiz</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // QUIZZES LIST VIEW
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.4fr 1fr" : "1fr", gap: "2rem" }}>
                    <div className="glass-card-static animate-fade-in" style={{ display: "flex", flexDirection: "column" }}>
                        <h3>Quizzes & Exams</h3>
                        {quizzes.length === 0 ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No quizzes created</div>
                                <div className="empty-state-text">No quiz evaluations are assigned to this course catalog yet.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", flex: 1 }}>
                                {quizzes.map(q => (
                                    <div key={q._id} className="glass-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                        <div>
                                            <div style={{ fontWeight: "600", color: "var(--text-main)" }}>{q.title}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                                                <span className="badge badge-student" style={{ fontSize: "0.65rem" }}>Limit: {q.durationMinutes} mins</span>
                                                <span className={isOverdue(q.dueDate) ? "badge badge-danger" : "badge"} style={{ background: isOverdue(q.dueDate) ? "" : "rgba(255,255,255,0.06)", border: isOverdue(q.dueDate) ? "" : "1px solid var(--border-color)", fontSize: "0.65rem", color: isOverdue(q.dueDate) ? "" : "var(--text-main)" }}>Due: {new Date(q.dueDate).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => loadQuizDetails(q._id)} className="btn btn-primary btn-sm" style={{ padding: "0.45rem 1rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                            <span>Open</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                <polyline points="9 18 15 12 9 6"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user.role !== "student" && (
                        <div className="glass-card-static" style={{ height: "fit-content" }}>
                            <h3>Create New Quiz Shell</h3>
                            {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}
                            {success && <div className="alert alert-success animate-fade-in" style={{ marginTop: "1rem" }}>{success}</div>}

                            <form onSubmit={handleCreateQuiz} style={{ marginTop: "1.25rem" }}>
                                <div className="form-group">
                                    <label>Quiz Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Chapter 1 Quiz" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Instructions</label>
                                    <textarea className="form-input" rows="3" placeholder="Specify instructions..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Time Limit (Minutes)</label>
                                    <input type="number" className="form-input" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                                </div>
                                <div className="form-group">
                                    <label>Due Date & Time</label>
                                    <input type="datetime-local" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>
                                    Create Quiz Shell
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 4. ATTENDANCE TAB COMPONENT
// ==========================================================================
const AttendanceTab = ({ attendanceStats, studentAttendance, courseId, user, enrolledStudents, onUpdate }) => {
    const [markingDate, setMarkingDate] = useState(new Date().toISOString().substring(0, 10));
    const [marks, setMarks] = useState({}); // { studentId: 'present'/'absent'/'late' }
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Initialize all student marks as present
        if (enrolledStudents) {
            const initial = {};
            enrolledStudents.forEach(stu => {
                initial[stu._id] = "present";
            });
            const timer = setTimeout(() => {
                setMarks(initial);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [enrolledStudents]);

    const handleStatusChange = (stuId, status) => {
        setMarks(prev => ({
            ...prev,
            [stuId]: status
        }));
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const records = Object.keys(marks).map(stuId => ({
            studentId: stuId,
            status: marks[stuId]
        }));

        try {
            await api.post("/attendance", {
                courseId,
                date: markingDate,
                records
            });
            alert("Attendance register saved!");
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {user.role === "student" ? (
                // STUDENT VIEW
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                    <div className="glass-card-static text-center" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "2rem" }}>
                        <h3>Overall Attendance</h3>
                        <div className="value" style={{ fontSize: "3.5rem", margin: "1.5rem 0", color: studentAttendance.percentage >= 75 ? "var(--success)" : "var(--error)", fontWeight: "800" }}>
                            {studentAttendance.percentage}%
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", lineHeight: "1.4" }}>
                            {studentAttendance.percentage >= 75 ? "You meet the minimum 75% attendance criteria! 👍" : "Warning: Attendance falls below 75% required minimum! 🚨"}
                        </p>
                    </div>

                    <div className="glass-card-static">
                        <h3>Attendance Log History</h3>
                        {(!studentAttendance.data || studentAttendance.data.length === 0) ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="16" y1="2" x2="16" y2="6"/>
                                        <line x1="8" y1="2" x2="8" y2="6"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No check-ins recorded</div>
                                <div className="empty-state-text">No attendance records have been registered for your account.</div>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ marginTop: "1rem" }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Class Session Date</th>
                                            <th>Check-In Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentAttendance.data.map((log, idx) => (
                                            <tr key={idx}>
                                                <td><strong>{new Date(log.date).toLocaleDateString()}</strong></td>
                                                <td>
                                                    <span className={`badge badge-${log.status === "present" ? "success" : log.status === "absent" ? "danger" : "warning"}`} style={{ fontSize: "0.75rem", fontWeight: "700" }}>
                                                        {log.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // LECTURER VIEW: ROSTER AND MARKING GRID
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
                    
                    {/* Mark Daily Attendance */}
                    <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                        <h3>Mark Daily Attendance</h3>
                        <form onSubmit={handleMarkAttendance} style={{ marginTop: "1rem", flex: 1, display: "flex", flexDirection: "column" }}>
                            <div className="form-group" style={{ maxWidth: "250px" }}>
                                <label>Lecture Date</label>
                                <input type="date" className="form-input" value={markingDate} onChange={e => setMarkingDate(e.target.value)} required />
                            </div>

                            {enrolledStudents.length === 0 ? (
                                <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                    <div className="empty-state-icon">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                        </svg>
                                    </div>
                                    <div className="empty-state-title">No students enrolled</div>
                                    <div className="empty-state-text">No student rosters are assigned to this course.</div>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", margin: "1.5rem 0", flex: 1 }}>
                                    {enrolledStudents.map(student => (
                                        <div key={student._id} className="glass-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 1rem", borderRadius: "12px", border: "1px solid var(--border-color)", flexWrap: "wrap", gap: "0.5rem" }}>
                                            <div>
                                                <span style={{ fontWeight: "600", color: "var(--text-main)" }}>{student.name}</span>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({student.studentId})</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.4rem" }}>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleStatusChange(student._id, "present")} 
                                                    className="btn btn-sm"
                                                    style={{ 
                                                        padding: "0.3rem 0.6rem", 
                                                        fontSize: "0.75rem", 
                                                        background: marks[student._id] === "present" ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.02)",
                                                        color: marks[student._id] === "present" ? "var(--success)" : "var(--text-muted)",
                                                        border: marks[student._id] === "present" ? "1px solid var(--success)" : "1px solid var(--border-color)",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Present
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleStatusChange(student._id, "absent")} 
                                                    className="btn btn-sm"
                                                    style={{ 
                                                        padding: "0.3rem 0.6rem", 
                                                        fontSize: "0.75rem", 
                                                        background: marks[student._id] === "absent" ? "rgba(239, 68, 68, 0.2)" : "rgba(255,255,255,0.02)",
                                                        color: marks[student._id] === "absent" ? "var(--error)" : "var(--text-muted)",
                                                        border: marks[student._id] === "absent" ? "1px solid var(--error)" : "1px solid var(--border-color)",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Absent
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleStatusChange(student._id, "late")} 
                                                    className="btn btn-sm"
                                                    style={{ 
                                                        padding: "0.3rem 0.6rem", 
                                                        fontSize: "0.75rem", 
                                                        background: marks[student._id] === "late" ? "rgba(245, 158, 11, 0.2)" : "rgba(255,255,255,0.02)",
                                                        color: marks[student._id] === "late" ? "#fbbf24" : "var(--text-muted)",
                                                        border: marks[student._id] === "late" ? "1px solid #fbbf24" : "1px solid var(--border-color)",
                                                        fontWeight: "600"
                                                    }}
                                                >
                                                    Late
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={submitting || enrolledStudents.length === 0} style={{ width: "100%", justifyContent: "center" }}>
                                {submitting ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                        <span>Saving register...</span>
                                    </div>
                                ) : "Submit Attendance Register"}
                            </button>
                        </form>
                    </div>

                    {/* Attendance stats summary */}
                    <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                        <h3>Attendance Stats Roster</h3>
                        {attendanceStats.length === 0 ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No data recorded</div>
                                <div className="empty-state-text">No attendance records submitted for stats calculations yet.</div>
                            </div>
                        ) : (
                            <div className="table-responsive" style={{ flex: 1, marginTop: "1rem" }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Present</th>
                                            <th>Late</th>
                                            <th>Absent</th>
                                            <th>Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceStats.map(stat => (
                                            <tr key={stat.id}>
                                                <td>{stat.name}</td>
                                                <td>{stat.present}</td>
                                                <td>{stat.late}</td>
                                                <td>{stat.absent}</td>
                                                <td>
                                                    <strong style={{ color: stat.percentage >= 75 ? "var(--success)" : "var(--error)" }}>
                                                        {stat.percentage}%
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 5. DISCUSSION FORUM TAB COMPONENT
// ==========================================================================
const ForumTab = ({ threads, courseId, user, onUpdate }) => {
    const [selectedThread, setSelectedThread] = useState(null);
    const [comments, setComments] = useState([]);

    // Thread Builder states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [posting, setPosting] = useState(false);

    // Comment Builder States
    const [commentText, setCommentText] = useState("");
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState("");

    const loadThreadDetails = async (threadId) => {
        try {
            const res = await api.get(`/forums/threads/${threadId}`);
            setSelectedThread(res.data.data.thread);
            setComments(res.data.data.comments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!title || !content) return;

        setPosting(true);
        try {
            await api.post("/forums/threads", { courseId, title, content });
            setTitle("");
            setContent("");
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create thread");
        } finally {
            setPosting(false);
        }
    };

    const handlePostComment = async (e, parentId = null) => {
        e.preventDefault();
        const text = parentId ? replyText : commentText;
        if (!text) return;

        try {
            await api.post("/forums/comments", {
                threadId: selectedThread._id,
                content: text,
                parentId
            });
            if (parentId) {
                setReplyText("");
                setReplyingToCommentId(null);
            } else {
                setCommentText("");
            }
            loadThreadDetails(selectedThread._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post comment");
        }
    };

    const handleDeleteThread = async (threadId) => {
        if (!window.confirm("Delete thread?")) return;
        try {
            await api.delete(`/forums/threads/${threadId}`);
            setSelectedThread(null);
            onUpdate();
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete comment?")) return;
        try {
            await api.delete(`/forums/comments/${commentId}`);
            loadThreadDetails(selectedThread._id);
        } catch (err) {
            console.error(err);
            alert("Delete failed");
        }
    };

    return (
        <div>
            {selectedThread ? (
                // THREAD DETAILS AND DISCUSSIONS VIEW
                <div className="glass-card-static animate-scale-in">
                    <button 
                        onClick={() => setSelectedThread(null)} 
                        className="btn btn-outline btn-sm" 
                        style={{ marginBottom: "1.5rem", display: "inline-flex", alignItems: "center", gap: "0.3rem" }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                            <line x1="19" y1="12" x2="5" y2="12"/>
                            <polyline points="12 19 5 12 12 5"/>
                        </svg>
                        <span>Back to Discussions</span>
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
                        <div>
                            <h2>{selectedThread.title}</h2>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                                By <strong style={{ color: "var(--text-main)" }}>{selectedThread.authorId?.name}</strong> ({selectedThread.authorId?.role}) • Posted: {new Date(selectedThread.createdAt).toLocaleString()}
                            </div>
                        </div>
                        {(user.role === "admin" || selectedThread.authorId?._id === user.id) && (
                            <button onClick={() => handleDeleteThread(selectedThread._id)} className="btn btn-danger btn-sm" style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                    <polyline points="3 6 5 6 21 6"/>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                </svg>
                                <span>Delete Thread</span>
                            </button>
                        )}
                    </div>
                    
                    <p style={{ marginTop: "1.25rem", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)", lineHeight: "1.6" }}>
                        {selectedThread.content}
                    </p>

                    {/* Comments Feed */}
                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                        <h3>Discussion Replies ({comments.length})</h3>

                        <div style={{ marginTop: "1.5rem" }}>
                            {comments.map(comment => (
                                <div key={comment._id} className="forum-comment-card" style={{ padding: "1.25rem", background: "rgba(255,255,255,0.01)", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                                        <span style={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <strong style={{ color: "var(--text-main)" }}>{comment.authorId?.name}</strong>
                                            <span className={`badge badge-${comment.authorId?.role}`} style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem" }}>
                                                {comment.authorId?.role}
                                            </span>
                                        </span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: "0.5rem 0", fontSize: "0.92rem", lineHeight: "1.5", color: "var(--text-main)" }}>{comment.content}</p>
                                    
                                    <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", borderTop: "1px dashed rgba(255,255,255,0.04)", paddingTop: "0.5rem" }}>
                                        <button onClick={() => setReplyingToCommentId(comment._id)} className="link-alt" style={{ border: "none", background: "none", fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                <polyline points="9 17 4 12 9 7"/>
                                                <path d="M20 18v-2a4 4 0 0 0-4-4H4"/>
                                            </svg>
                                            <span>Reply</span>
                                        </button>
                                        {(user.role === "admin" || comment.authorId?._id === user.id) && (
                                            <button onClick={() => handleDeleteComment(comment._id)} className="link-alt" style={{ border: "none", background: "none", fontSize: "0.8rem", cursor: "pointer", color: "var(--error)", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                                </svg>
                                                <span>Delete</span>
                                            </button>
                                        )}
                                    </div>

                                    {replyingToCommentId === comment._id && (
                                        <form onSubmit={(e) => handlePostComment(e, comment._id)} style={{ marginTop: "1rem", maxWidth: "500px" }} className="animate-slide-down">
                                            <input type="text" className="form-input" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} required />
                                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                                <button type="submit" className="btn btn-primary btn-sm">Post Reply</button>
                                                <button type="button" onClick={() => setReplyingToCommentId(null)} className="btn btn-outline btn-sm">Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Top-level comment box */}
                        <form onSubmit={(e) => handlePostComment(e, null)} style={{ marginTop: "2.5rem", maxWidth: "600px" }}>
                            <h4>Join the Discussion</h4>
                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <textarea className="form-input" rows="3" placeholder="Post an answer or ask a question..." value={commentText} onChange={e => setCommentText(e.target.value)} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary btn-sm">Submit Comment</button>
                        </form>
                    </div>
                </div>
            ) : (
                // THREADS LIST VIEW
                <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
                    <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                        <h3>Discussions Forum</h3>
                        {threads.length === 0 ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No threads active</div>
                                <div className="empty-state-text">Be the first to start a conversation in this course.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem", flex: 1 }}>
                                {threads.map(thread => (
                                    <div key={thread._id} className="glass-card-inner" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                                        <div>
                                            <div onClick={() => loadThreadDetails(thread._id)} style={{ fontWeight: "600", cursor: "pointer", fontSize: "1.02rem" }} className="link-alt">
                                                {thread.title}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                                By {thread.authorId?.name} ({thread.authorId?.role}) • {new Date(thread.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button onClick={() => loadThreadDetails(thread._id)} className="btn btn-outline btn-sm" style={{ padding: "0.4rem 0.8rem", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                            <span>Open</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                <polyline points="9 18 15 12 9 6"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card-static" style={{ height: "fit-content" }}>
                        <h3>Post New Thread</h3>
                        <form onSubmit={handleCreateThread} style={{ marginTop: "1.25rem" }}>
                            <div className="form-group">
                                <label>Topic Title</label>
                                <input type="text" className="form-input" placeholder="e.g. Question regarding Assignment 1" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Body / Description</label>
                                <textarea className="form-input" rows="5" placeholder="Elaborate your discussion prompt..." value={content} onChange={e => setContent(e.target.value)} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={posting} style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>
                                {posting ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                        <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                        <span>Posting...</span>
                                    </div>
                                ) : "Create Thread Topic"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 6. ANNOUNCEMENTS TAB COMPONENT
// ==========================================================================
const AnnouncementsTab = ({ announcements, courseId, user, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("normal");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);

    const handlePost = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !content) return setError("Please fill in all fields");

        setPosting(true);
        try {
            await api.post("/announcements", {
                title,
                content,
                scope: "course",
                targetId: courseId,
                priority
            });
            setTitle("");
            setContent("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post announcement");
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (annId) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            await api.delete(`/announcements/${annId}`);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="form-row" style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.4fr 1fr" : "1fr", gap: "2rem" }}>
            <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                <h3>Course Announcements</h3>

                {announcements.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">No notices posted</div>
                        <div className="empty-state-text">No announcements posted for this course segment yet.</div>
                    </div>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "1.2rem", flex: 1 }}>
                        {announcements.map(ann => (
                            <div key={ann._id} className="glass-card-inner" style={{ padding: "1.25rem", borderRadius: "12px", border: "1px solid var(--border-color)", borderLeft: ann.priority === "high" ? "3px solid var(--error)" : "1px solid var(--border-color)", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                                    <span style={{ fontWeight: "600", fontSize: "1.05rem", color: ann.priority === "high" ? "var(--error)" : "var(--text-main)" }}>
                                        {ann.title}
                                    </span>
                                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                        {ann.priority === "high" && (
                                            <span className="badge badge-danger" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>URGENT</span>
                                        )}
                                        {user.role !== "student" && (
                                            <button 
                                                onClick={() => handleDelete(ann._id)} 
                                                className="btn-icon" 
                                                title="Delete Announcement"
                                                style={{ color: "var(--error)", background: "rgba(255,255,255,0.02)" }}
                                            >
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                                    <polyline points="3 6 5 6 21 6"/>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", margin: "0.5rem 0", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>{ann.content}</p>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.8rem", marginTop: "0.5rem", borderTop: "1px dashed rgba(255,255,255,0.04)", paddingTop: "0.5rem" }}>
                                    <span>Posted by {ann.authorId?.name || "Lecturer"}</span>
                                    <span>•</span>
                                    <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user.role !== "student" && (
                <div className="glass-card-static" style={{ height: "fit-content" }}>
                    <h3>Post Course Announcement</h3>
                    {error && <div className="alert alert-danger animate-fade-in" style={{ marginTop: "1rem" }}>{error}</div>}

                    <form onSubmit={handlePost} style={{ marginTop: "1.25rem" }}>
                        <div className="form-group">
                            <label>Notice Title</label>
                            <input type="text" className="form-input" placeholder="e.g. Lecture Postponed" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Announcement Body</label>
                            <textarea className="form-input" rows="4" placeholder="Type detail description..." value={content} onChange={e => setContent(e.target.value)} required></textarea>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)} style={{ background: "var(--background-dark)" }}>
                                <option value="normal">Normal Notice</option>
                                <option value="high">Urgent/High Priority Notice 🚨</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={posting} style={{ width: "100%", marginTop: "1.5rem", justifyContent: "center" }}>
                            {posting ? (
                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <div className="spinner" style={{ width: "16px", height: "16px", borderWidth: "2px" }}></div>
                                    <span>Posting...</span>
                                </div>
                            ) : "Post Announcement"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;

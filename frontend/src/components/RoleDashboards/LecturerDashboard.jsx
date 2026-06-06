import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";

const LecturerDashboard = () => {
    const { user } = useContext(AuthContext);
    const [metrics, setMetrics] = useState({ totalCourses: 0, pendingGrading: 0, totalStudents: 0 });
    const [myCourses, setMyCourses] = useState([]);
    const [pendingSubmissions, setPendingSubmissions] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    // Grading modal states
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [gradeValue, setGradeValue] = useState("");
    const [feedbackValue, setFeedbackValue] = useState("");
    const [gradingLoading, setGradingLoading] = useState(false);
    const [gradingError, setGradingError] = useState("");
    const [gradingSuccess, setGradingSuccess] = useState("");

    // Quick announcement states
    const [announceCourseId, setAnnounceCourseId] = useState("");
    const [announceTitle, setAnnounceTitle] = useState("");
    const [announceContent, setAnnounceContent] = useState("");
    const [announcePriority, setAnnouncePriority] = useState("normal");
    const [announceLoading, setAnnounceLoading] = useState(false);
    const [announceError, setAnnounceError] = useState("");
    const [announceSuccess, setAnnounceSuccess] = useState("");

    useEffect(() => {
        if (!user?._id) return;

        const fetchDashboardData = async () => {
            try {
                const [metricsRes, coursesRes, pendingRes, feedRes] = await Promise.all([
                    api.get("/reports/lecturer"),
                    api.get(`/courses?lecturerId=${user._id}`),
                    api.get("/assignments/lecturer/pending"),
                    api.get("/announcements/feed")
                ]);
                setMetrics(metricsRes.data.data);
                setMyCourses(coursesRes.data.data);
                setPendingSubmissions(pendingRes.data.data);
                setAnnouncements(feedRes.data.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to load lecturer dashboard metrics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user]);

    // Evaluation modal handlers
    const handleOpenGrading = (sub) => {
        setSelectedSubmission(sub);
        setGradeValue(sub.grade !== null ? sub.grade.toString() : "");
        setFeedbackValue(sub.feedback || "");
        setGradingError("");
        setGradingSuccess("");
    };

    const handleCloseGrading = () => {
        setSelectedSubmission(null);
        setGradeValue("");
        setFeedbackValue("");
        setGradingError("");
        setGradingSuccess("");
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        if (!selectedSubmission) return;

        const maxMarks = selectedSubmission.assignmentId?.maxMarks || 100;
        const numericGrade = parseFloat(gradeValue);
        if (isNaN(numericGrade) || numericGrade < 0 || numericGrade > maxMarks) {
            setGradingError(`Grade must be a number between 0 and ${maxMarks}.`);
            return;
        }

        setGradingLoading(true);
        setGradingError("");
        setGradingSuccess("");

        try {
            const res = await api.put(`/assignments/submission/${selectedSubmission._id}/grade`, {
                grade: numericGrade,
                feedback: feedbackValue
            });

            if (res.data.success) {
                setGradingSuccess("Submission graded successfully!");
                
                // Re-fetch dashboard stats and pending submissions
                const [metricsRes, pendingRes] = await Promise.all([
                    api.get("/reports/lecturer"),
                    api.get("/assignments/lecturer/pending")
                ]);
                setMetrics(metricsRes.data.data);
                setPendingSubmissions(pendingRes.data.data);

                setTimeout(() => {
                    handleCloseGrading();
                }, 1500);
            }
        } catch (err) {
            console.error("Error grading submission:", err);
            setGradingError(err.response?.data?.message || "Failed to grade submission.");
        } finally {
            setGradingLoading(false);
        }
    };

    // Announcement handlers
    const handleAnnounceSubmit = async (e) => {
        e.preventDefault();
        if (!announceCourseId) {
            setAnnounceError("Please select a course.");
            return;
        }
        if (!announceTitle.trim() || !announceContent.trim()) {
            setAnnounceError("Title and content are required.");
            return;
        }

        setAnnounceLoading(true);
        setAnnounceError("");
        setAnnounceSuccess("");

        try {
            const res = await api.post("/announcements", {
                scope: "course",
                targetId: announceCourseId,
                title: announceTitle.trim(),
                content: announceContent.trim(),
                priority: announcePriority
            });

            if (res.data.success) {
                setAnnounceSuccess("Announcement published successfully!");
                
                // Clear fields
                setAnnounceTitle("");
                setAnnounceContent("");
                setAnnouncePriority("normal");

                // Refresh announcement feed
                const feedRes = await api.get("/announcements/feed");
                setAnnouncements(feedRes.data.data.slice(0, 5));

                setTimeout(() => setAnnounceSuccess(""), 3000);
            }
        } catch (err) {
            console.error("Error creating announcement:", err);
            setAnnounceError(err.response?.data?.message || "Failed to publish announcement.");
        } finally {
            setAnnounceLoading(false);
        }
    };

    const handleDeleteAnnouncement = async (annId) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            const res = await api.delete(`/announcements/${annId}`);
            if (res.data.success) {
                // Refresh announcements feed
                const feedRes = await api.get("/announcements/feed");
                setAnnouncements(feedRes.data.data.slice(0, 5));
            }
        } catch (err) {
            console.error("Error deleting announcement:", err);
            alert(err.response?.data?.message || "Failed to delete announcement.");
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "500px", height: "1.2rem", marginBottom: "2rem" }}></div>

                <div className="stats-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "140px" }}></div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                    <div className="glass-card-static skeleton-card" style={{ height: "350px" }}></div>
                    <div className="glass-card-static skeleton-card" style={{ height: "350px" }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Lecturer Portal Dashboard</h1>
            <p className="page-subtitle">Manage course materials, assign coursework, track student attendances, and grade submissions.</p>

            {/* Metrics Grid */}
            <div className="stats-grid animate-slide-up stagger-1">
                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3>Assigned Courses</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.totalCourses}</div>
                    <div className="stat-subtitle">Active course sections</div>
                    <Link to="/courses" className="stat-link">
                        <span>Go to courses</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3>Submissions to Grade</h3>
                        <div className="stat-card-icon" style={{ 
                            background: metrics.pendingGrading > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: metrics.pendingGrading > 0 ? "#fbbf24" : "#34d399"
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value" style={{ color: metrics.pendingGrading > 0 ? "var(--warning)" : "var(--success)" }}>
                        {metrics.pendingGrading}
                    </div>
                    <div className="stat-subtitle">Pending evaluation</div>
                    <span className="stat-link" style={{ cursor: "default" }}>
                        <span>Requires action</span>
                    </span>
                </div>

                <div className="stat-card">
                    <div className="stat-card-header">
                        <h3>Total Enrolled Students</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.totalStudents}</div>
                    <div className="stat-subtitle">Students across sections</div>
                    <span className="stat-link" style={{ cursor: "default" }}>
                        <span>Across all classes</span>
                    </span>
                </div>
            </div>

            {/* Pending Submissions Queue */}
            <div className="glass-card-static animate-slide-up stagger-2" style={{ marginTop: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0 }}>Submissions Awaiting Evaluation</h3>
                    <span className="badge badge-warning" style={{ fontSize: "0.8rem", padding: "0.25rem 0.6rem" }}>
                        {pendingSubmissions.length} Pending
                    </span>
                </div>
                
                {pendingSubmissions.length === 0 ? (
                    <div className="empty-state" style={{ padding: "3rem 1rem" }}>
                        <div className="empty-state-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                <polyline points="22 4 12 14.01 9 11.01"/>
                            </svg>
                        </div>
                        <div className="empty-state-title">All Caught Up!</div>
                        <div className="empty-state-text">There are no pending student submissions awaiting evaluation.</div>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="premium-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Course</th>
                                    <th>Assignment</th>
                                    <th>Submitted At</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingSubmissions.map(sub => (
                                    <tr key={sub._id}>
                                        <td>
                                            <div>
                                                <strong style={{ color: "var(--text-main)", fontSize: "0.95rem" }}>{sub.studentId?.name}</strong>
                                                <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginTop: "0.15rem" }}>
                                                    ID: {sub.studentId?.studentId || "N/A"}
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                                                <span className="badge badge-neutral" style={{ fontSize: "0.68rem", fontWeight: "700", alignSelf: "flex-start" }}>
                                                    {sub.assignmentId?.courseId?.code}
                                                </span>
                                                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
                                                    {sub.assignmentId?.courseId?.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontWeight: "500" }}>{sub.assignmentId?.title}</span>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: "0.85rem" }}>
                                                {new Date(sub.submittedAt).toLocaleString(undefined, {
                                                    dateStyle: "medium",
                                                    timeStyle: "short"
                                                })}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${sub.status === "late" ? "badge-danger" : "badge-success"}`} style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                                                {sub.status.toUpperCase()}
                                            </span>
                                        </td>
                                        <td>
                                            <button 
                                                onClick={() => handleOpenGrading(sub)}
                                                className="btn btn-outline" 
                                                style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", background: "var(--primary-glow)", borderColor: "rgba(124, 58, 237, 0.3)" }}
                                            >
                                                Evaluate
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Courses and Announcements Row */}
            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                
                {/* Courses list */}
                <div className="glass-card-static animate-slide-up stagger-3" style={{ display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>My Assigned Courses</h3>
                    {myCourses.length === 0 ? (
                        <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                            <div className="empty-state-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                                </svg>
                            </div>
                            <div className="empty-state-title">No assigned courses</div>
                            <div className="empty-state-text">You have not been assigned to teach any courses yet.</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                            {myCourses.map(course => (
                                <div 
                                    key={course._id} 
                                    className="glass-card-inner animate-fade-in"
                                    style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        padding: "1rem", 
                                        borderRadius: "12px", 
                                        border: "1px solid var(--border-color)" 
                                    }}
                                >
                                    <div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                                            <span className="badge badge-lecturer" style={{ fontSize: "0.7rem", fontWeight: "700" }}>{course.code}</span>
                                            <strong style={{ fontSize: "0.95rem", color: "var(--text-main)" }}>{course.name}</strong>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                                            Credits: {course.credits} • Semester: {course.semester}
                                        </div>
                                    </div>
                                    <Link to={`/courses/${course._id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                        <span>Manage</span>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
                                            <polyline points="9 18 15 12 9 6"/>
                                        </svg>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Announcements Panel */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    
                    {/* Quick Announcement Publisher */}
                    <div className="glass-card-static animate-slide-up stagger-4">
                        <h3 style={{ marginBottom: "1.25rem" }}>Quick Announcement</h3>
                        
                        {announceError && (
                            <div className="alert alert-danger" style={{ padding: "0.6rem 0.8rem", marginBottom: "1rem" }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                                <span>{announceError}</span>
                            </div>
                        )}
                        {announceSuccess && (
                            <div className="alert alert-success" style={{ padding: "0.6rem 0.8rem", marginBottom: "1rem" }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                                <span>{announceSuccess}</span>
                            </div>
                        )}

                        <form onSubmit={handleAnnounceSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="announce-course" style={{ fontSize: "0.75rem" }}>Target Course <span style={{ color: "var(--error)" }}>*</span></label>
                                <select
                                    id="announce-course"
                                    className="form-input"
                                    style={{ padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
                                    value={announceCourseId}
                                    onChange={(e) => setAnnounceCourseId(e.target.value)}
                                    required
                                >
                                    <option value="">-- Select Course --</option>
                                    {myCourses.map(course => (
                                        <option key={course._id} value={course._id}>
                                            {course.code} - {course.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="announce-title" style={{ fontSize: "0.75rem" }}>Title <span style={{ color: "var(--error)" }}>*</span></label>
                                <input
                                    id="announce-title"
                                    type="text"
                                    className="form-input"
                                    style={{ padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
                                    placeholder="e.g. Schedule Update / Quiz Postponed"
                                    value={announceTitle}
                                    onChange={(e) => setAnnounceTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="announce-content" style={{ fontSize: "0.75rem" }}>Content <span style={{ color: "var(--error)" }}>*</span></label>
                                <textarea
                                    id="announce-content"
                                    className="form-input"
                                    style={{ padding: "0.6rem 0.8rem", fontSize: "0.88rem" }}
                                    rows="3"
                                    placeholder="Type your announcements message details here..."
                                    value={announceContent}
                                    onChange={(e) => setAnnounceContent(e.target.value)}
                                    required
                                ></textarea>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                                <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                                    <label htmlFor="announce-priority" style={{ fontSize: "0.75rem" }}>Priority</label>
                                    <select
                                        id="announce-priority"
                                        className="form-input"
                                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.85rem" }}
                                        value={announcePriority}
                                        onChange={(e) => setAnnouncePriority(e.target.value)}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    style={{ padding: "0.6rem 1.2rem", fontSize: "0.88rem", marginTop: "1.2rem" }}
                                    disabled={announceLoading || myCourses.length === 0}
                                >
                                    {announceLoading ? "Publishing..." : "Publish"}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Campus Announcements Feed */}
                    <div className="glass-card-static animate-slide-up stagger-5" style={{ display: "flex", flexDirection: "column" }}>
                        <h3 style={{ marginBottom: "1.5rem" }}>Announcements Feed</h3>
                        {announcements.length === 0 ? (
                            <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                                <div className="empty-state-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                        <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                    </svg>
                                </div>
                                <div className="empty-state-title">No announcements</div>
                                <div className="empty-state-text">Announcements from administration will show up here.</div>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                                {announcements.map(ann => (
                                    <div 
                                        key={ann._id} 
                                        className="glass-card-inner animate-fade-in" 
                                        style={{ 
                                            padding: "1rem", 
                                            borderRadius: "12px", 
                                            border: "1px solid var(--border-color)", 
                                            borderLeft: ann.priority === "high" ? "4px solid var(--error)" : "1px solid var(--border-color)" 
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                                            <div>
                                                <div style={{ fontWeight: "600", fontSize: "0.92rem", color: "var(--text-main)" }}>
                                                    {ann.title}
                                                </div>
                                                {ann.targetId && (
                                                    <span className="badge badge-neutral" style={{ fontSize: "0.65rem", padding: "0.1rem 0.3rem", marginTop: "0.25rem", display: "inline-block" }}>
                                                        {ann.targetId.code}
                                                    </span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                {ann.priority === "high" && (
                                                    <span className="badge badge-danger" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>HIGH</span>
                                                )}
                                                {ann.authorId?._id === user?._id && (
                                                    <button 
                                                        onClick={() => handleDeleteAnnouncement(ann._id)}
                                                        style={{ background: "none", border: "none", color: "var(--error)", cursor: "pointer", padding: "0.2rem", display: "flex", alignItems: "center" }}
                                                        title="Delete Announcement"
                                                    >
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                            <line x1="10" y1="11" x2="10" y2="17"></line>
                                                            <line x1="14" y1="11" x2="14" y2="17"></line>
                                                        </svg>
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.4rem 0 0 0", lineHeight: "1.4" }}>{ann.content}</p>
                                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "var(--text-dim)", marginTop: "0.6rem" }}>
                                            <span>By: {ann.authorId?.name || "Admin"}</span>
                                            <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {/* Grading Modal */}
            {selectedSubmission && (
                <div className="modal-overlay">
                    <div className="modal-card animate-scale-in" style={{ maxWidth: "600px" }}>
                        <div className="modal-header">
                            <h3>Evaluate Submission</h3>
                            <button className="modal-close" onClick={handleCloseGrading}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <form onSubmit={handleGradeSubmit}>
                            <div className="modal-body">
                                {gradingError && (
                                    <div className="alert alert-danger" style={{ marginBottom: "1.25rem" }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                            <circle cx="12" cy="12" r="10"/>
                                            <line x1="12" y1="8" x2="12" y2="12"/>
                                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                                        </svg>
                                        <span>{gradingError}</span>
                                    </div>
                                )}
                                {gradingSuccess && (
                                    <div className="alert alert-success" style={{ marginBottom: "1.25rem" }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                            <polyline points="22 4 12 14.01 9 11.01"/>
                                        </svg>
                                        <span>{gradingSuccess}</span>
                                    </div>
                                )}
                                
                                <div style={{ marginBottom: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Student</span>
                                        <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "0.15rem" }}>{selectedSubmission.studentId?.name}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>ID: {selectedSubmission.studentId?.studentId || "N/A"}</div>
                                    </div>
                                    <div>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Assignment</span>
                                        <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "0.15rem" }}>{selectedSubmission.assignmentId?.title}</div>
                                        <div style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Course: {selectedSubmission.assignmentId?.courseId?.code}</div>
                                    </div>
                                </div>

                                <div style={{ marginBottom: "1.5rem" }}>
                                    <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700", display: "block", marginBottom: "0.4rem" }}>Submitted File</span>
                                    <a 
                                        href={`${api.defaults.baseURL.replace("/api", "")}${selectedSubmission.fileUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="btn btn-outline"
                                        style={{ 
                                            display: "inline-flex", 
                                            alignItems: "center", 
                                            gap: "0.5rem", 
                                            padding: "0.5rem 1rem", 
                                            fontSize: "0.85rem",
                                            background: "rgba(255, 255, 255, 0.02)"
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        <span>Download / View Student Document</span>
                                    </a>
                                </div>

                                {selectedSubmission.comments && (
                                    <div style={{ marginBottom: "1.5rem", padding: "0.85rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-dim)", textTransform: "uppercase", fontWeight: "700" }}>Student's Notes</span>
                                        <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--text-secondary)", fontStyle: "italic", lineHeight: "1.4" }}>
                                            "{selectedSubmission.comments}"
                                        </p>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                                    <label htmlFor="grade-input">Grade (Out of {selectedSubmission.assignmentId?.maxMarks || 100}) <span style={{ color: "var(--error)" }}>*</span></label>
                                    <input 
                                        id="grade-input"
                                        type="number" 
                                        className="form-input" 
                                        value={gradeValue}
                                        onChange={(e) => setGradeValue(e.target.value)}
                                        max={selectedSubmission.assignmentId?.maxMarks || 100}
                                        min="0"
                                        step="any"
                                        required
                                        placeholder="Enter grade score"
                                    />
                                </div>

                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label htmlFor="feedback-input">Evaluation Feedback</label>
                                    <textarea 
                                        id="feedback-input"
                                        className="form-input" 
                                        rows="4"
                                        value={feedbackValue}
                                        onChange={(e) => setFeedbackValue(e.target.value)}
                                        placeholder="Write constructive evaluation notes for the student..."
                                    ></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-outline" onClick={handleCloseGrading} disabled={gradingLoading}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={gradingLoading}>
                                    {gradingLoading ? "Submitting..." : "Submit Evaluation"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LecturerDashboard;

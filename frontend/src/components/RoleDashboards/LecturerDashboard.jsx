import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const LecturerDashboard = () => {
    const [metrics, setMetrics] = useState({ totalCourses: 0, pendingGrading: 0, totalStudents: 0 });
    const [myCourses, setMyCourses] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [metricsRes, coursesRes, feedRes] = await Promise.all([
                    api.get("/reports/lecturer"),
                    api.get("/courses"), // Will be filtered by lecturerId in controller
                    api.get("/announcements/feed")
                ]);
                setMetrics(metricsRes.data.data);
                // Filter courses taught by me
                setMyCourses(coursesRes.data.data);
                setAnnouncements(feedRes.data.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to load lecturer dashboard metrics:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

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
            <div className="stats-grid">
                <div className="stat-card animate-slide-up stagger-1">
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

                <div className="stat-card animate-slide-up stagger-2">
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

                <div className="stat-card animate-slide-up stagger-3">
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

            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                {/* Courses list */}
                <div className="glass-card-static animate-slide-up stagger-4" style={{ display: "flex", flexDirection: "column" }}>
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

                {/* Campus Announcements */}
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
                                <div key={ann._id} className="glass-card-inner" style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", borderLeft: ann.priority === "high" ? "3px solid var(--error)" : "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                                        <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "var(--text-main)" }}>
                                            {ann.title}
                                        </div>
                                        {ann.priority === "high" && (
                                            <span className="badge badge-danger" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>HIGH</span>
                                        )}
                                    </div>
                                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0.4rem 0 0 0", lineHeight: "1.4" }}>{ann.content}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LecturerDashboard;

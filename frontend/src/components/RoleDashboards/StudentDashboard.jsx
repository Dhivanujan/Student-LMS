import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const StudentDashboard = () => {
    const [metrics, setMetrics] = useState({ enrolledCourses: 0, gpa: 0, attendance: 100, upcomingAssignments: [] });
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [metricsRes, feedRes] = await Promise.all([
                    api.get("/reports/student"),
                    api.get("/announcements/feed")
                ]);
                setMetrics(metricsRes.data.data);
                setAnnouncements(feedRes.data.data.slice(0, 5)); // Show latest 5
            } catch (err) {
                console.error("Failed to load student dashboard metrics:", err);
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

    // Calculations for Progress Rings
    const gpaPercent = Math.min(100, Math.max(0, (metrics.gpa / 4.0) * 100));
    const attendancePercent = Math.min(100, Math.max(0, metrics.attendance || 0));

    // Calculate urgency for deadlines
    const getUrgency = (dueDateStr) => {
        const diff = new Date(dueDateStr) - new Date();
        const days = diff / (1000 * 60 * 60 * 24);
        if (days < 0) return { label: "Overdue", class: "badge-danger", border: "3px solid var(--danger)" };
        if (days <= 1) return { label: "Due Today", class: "badge-danger", border: "3px solid var(--danger)" };
        if (days <= 3) return { label: "Due Soon", class: "badge-warning", border: "3px solid var(--warning)" };
        return { label: `Due in ${Math.ceil(days)} days`, class: "badge-info", border: "1px solid var(--border-color)" };
    };

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">Welcome Back!</h1>
            <p className="page-subtitle">Track your coursework, grades, and upcoming deadlines.</p>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card animate-slide-up stagger-1">
                    <div className="stat-card-header">
                        <h3>Enrolled Courses</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(139, 92, 246, 0.15)", color: "#a78bfa" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.enrolledCourses}</div>
                    <div className="stat-subtitle">Currently active classes</div>
                    <Link to="/courses" className="stat-link">
                        <span>View all courses</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>

                <div className="stat-card animate-slide-up stagger-2">
                    <div className="stat-card-header">
                        <h3>Cumulative GPA</h3>
                        <div className="progress-ring-container">
                            <svg className="progress-ring" width="44" height="44">
                                <circle className="progress-ring-bg" cx="22" cy="22" r="18" strokeWidth="3" />
                                <circle 
                                    className="progress-ring-fill" 
                                    cx="22" 
                                    cy="22" 
                                    r="18" 
                                    strokeWidth="3" 
                                    stroke="#a78bfa"
                                    strokeDasharray="113" 
                                    strokeDashoffset={113 - (113 * gpaPercent) / 100}
                                />
                            </svg>
                            <span style={{ position: "absolute", fontSize: "0.7rem", fontWeight: "700" }}>{metrics.gpa}</span>
                        </div>
                    </div>
                    <div className="value">{metrics.gpa} <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", fontWeight: "500" }}>/ 4.0</span></div>
                    <div className="stat-subtitle">Based on graded work</div>
                    <span className="stat-link" style={{ cursor: "default" }}>
                        <span>Academic standing</span>
                    </span>
                </div>

                <div className="stat-card animate-slide-up stagger-3">
                    <div className="stat-card-header">
                        <h3>Overall Attendance</h3>
                        <div className="progress-ring-container">
                            <svg className="progress-ring" width="44" height="44">
                                <circle className="progress-ring-bg" cx="22" cy="22" r="18" strokeWidth="3" />
                                <circle 
                                    className="progress-ring-fill" 
                                    cx="22" 
                                    cy="22" 
                                    r="18" 
                                    strokeWidth="3" 
                                    stroke={attendancePercent >= 75 ? "#34d399" : attendancePercent >= 50 ? "#fbbf24" : "#f87171"}
                                    strokeDasharray="113" 
                                    strokeDashoffset={113 - (113 * attendancePercent) / 100}
                                />
                            </svg>
                            <span style={{ position: "absolute", fontSize: "0.7rem", fontWeight: "700" }}>%</span>
                        </div>
                    </div>
                    <div className="value">{metrics.attendance}%</div>
                    <div className="stat-subtitle">Target presence: &gt; 75%</div>
                    <span className="stat-link" style={{ cursor: "default" }}>
                        <span>Course attendance rate</span>
                    </span>
                </div>
            </div>

            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                {/* Announcements Feed */}
                <div className="glass-card-static animate-slide-up stagger-4" style={{ display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Campus Announcements Feed</h3>
                    {announcements.length === 0 ? (
                        <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                            <div className="empty-state-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                            </div>
                            <div className="empty-state-title">No announcements</div>
                            <div className="empty-state-text">No announcements have been posted for your feed.</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", flex: 1 }}>
                            {announcements.map(ann => (
                                <div key={ann._id} className="glass-card-inner animate-fade-in" style={{ padding: "1rem", borderRadius: "12px", border: "1px solid var(--border-color)", borderLeft: ann.priority === "high" ? "3px solid var(--error)" : "1px solid var(--border-color)" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <span style={{ fontWeight: "600", color: "var(--text-main)", fontSize: "0.95rem" }}>
                                            {ann.title}
                                        </span>
                                        <div style={{ display: "flex", gap: "0.4rem" }}>
                                            {ann.priority === "high" && (
                                                <span className="badge badge-danger" style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem" }}>URGENT</span>
                                            )}
                                            <span className="badge" style={{ background: "rgba(255,255,255,0.06)", fontSize: "0.65rem" }}>
                                                {ann.scope}
                                            </span>
                                        </div>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.4rem 0", lineHeight: "1.4" }}>{ann.content}</p>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.8rem", marginTop: "0.5rem" }}>
                                        <span>By {ann.authorId?.name || "Administrator"}</span>
                                        <span>•</span>
                                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="glass-card-static animate-slide-up stagger-5" style={{ display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Upcoming Deadlines</h3>
                    {metrics.upcomingAssignments.length === 0 ? (
                        <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                            <div className="empty-state-icon" style={{ color: "var(--success)" }}>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                                    <polyline points="22 4 12 14.01 9 11.01"/>
                                </svg>
                            </div>
                            <div className="empty-state-title">All caught up!</div>
                            <div className="empty-state-text">No pending assignments. Good job!</div>
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: 1 }}>
                            {metrics.upcomingAssignments.map(ass => {
                                const urgency = getUrgency(ass.dueDate);
                                return (
                                    <div 
                                        key={ass._id} 
                                        className="glass-card-inner animate-fade-in"
                                        style={{ 
                                            padding: "1rem", 
                                            borderRadius: "12px", 
                                            border: urgency.border
                                        }}
                                    >
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                                            <div style={{ fontWeight: "600", fontSize: "0.92rem", color: "var(--text-main)" }}>{ass.title}</div>
                                            <span className={`badge ${urgency.class}`} style={{ fontSize: "0.65rem", padding: "0.15rem 0.4rem", whiteSpace: "nowrap" }}>
                                                {urgency.label}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.4rem 0 0.8rem 0" }}>
                                            Due: {new Date(ass.dueDate).toLocaleString()}
                                        </div>
                                        <Link to={`/courses/${ass.courseId}`} className="btn btn-outline btn-sm" style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}>
                                            <span>Go to Course</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "10px", height: "10px" }}>
                                                <polyline points="9 18 15 12 9 6"/>
                                            </svg>
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

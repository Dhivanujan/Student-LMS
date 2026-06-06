import React, { useState, useEffect } from "react";
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
        return <div className="text-center">Loading dashboard metrics...</div>;
    }

    return (
        <div>
            <h1 className="page-title">Welcome Student Dashboard</h1>
            <p className="page-subtitle">Track your coursework, grades, and upcoming deadlines.</p>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Enrolled Courses</h3>
                    <div className="value">{metrics.enrolledCourses}</div>
                    <Link to="/courses" className="link-alt" style={{ fontSize: "0.85rem" }}>View all courses</Link>
                </div>
                <div className="stat-card">
                    <h3>Cumulative GPA</h3>
                    <div className="value">⭐ {metrics.gpa} / 4.0</div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Based on graded work</span>
                </div>
                <div className="stat-card">
                    <h3>Overall Attendance</h3>
                    <div className="value">📅 {metrics.attendance}%</div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Target: &gt; 75%</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                {/* Announcements Feed */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: "1.5rem" }}>Campus Announcements Feed</h3>
                    {announcements.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No announcements posted.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
                            {announcements.map(ann => (
                                <div key={ann._id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                                        <span style={{ fontWeight: "600", color: ann.priority === "high" ? "var(--error)" : "var(--text-main)" }}>
                                            {ann.title} {ann.priority === "high" && "🚨"}
                                        </span>
                                        <span className="badge" style={{ background: "rgba(255,255,255,0.05)", fontSize: "0.7rem" }}>
                                            {ann.scope}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0" }}>{ann.content}</p>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", gap: "0.8rem" }}>
                                        <span>By {ann.authorId?.name}</span>
                                        <span>•</span>
                                        <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Upcoming Deadlines */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: "1.5rem" }}>Upcoming Deadlines</h3>
                    {metrics.upcomingAssignments.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No pending assignments! Good job.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {metrics.upcomingAssignments.map(ass => (
                                <div key={ass._id} style={{ background: "rgba(0,0,0,0.15)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                    <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>{ass.title}</div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0" }}>
                                        Due Date: {new Date(ass.dueDate).toLocaleString()}
                                    </div>
                                    <Link to={`/courses/${ass.courseId}`} className="link-alt" style={{ fontSize: "0.8rem" }}>
                                        Go to Course
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;

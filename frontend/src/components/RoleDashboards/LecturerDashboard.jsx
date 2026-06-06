import React, { useState, useEffect } from "react";
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
        return <div className="text-center">Loading dashboard metrics...</div>;
    }

    return (
        <div>
            <h1 className="page-title">Lecturer Portal Dashboard</h1>
            <p className="page-subtitle">Manage course materials, assign coursework, track student attendances, and grade submissions.</p>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Assigned Courses</h3>
                    <div className="value">{metrics.totalCourses}</div>
                    <Link to="/courses" className="link-alt" style={{ fontSize: "0.85rem" }}>Go to courses</Link>
                </div>
                <div className="stat-card">
                    <h3>Submissions to Grade</h3>
                    <div className="value" style={{ color: metrics.pendingGrading > 0 ? "var(--warning)" : "var(--success)" }}>
                        {metrics.pendingGrading}
                    </div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Requires action</span>
                </div>
                <div className="stat-card">
                    <h3>Total Enrolled Students</h3>
                    <div className="value">{metrics.totalStudents}</div>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Across all assigned sections</span>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                {/* Courses list */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: "1.5rem" }}>My Assigned Courses</h3>
                    {myCourses.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>You have not been assigned to teach any courses yet.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {myCourses.map(course => (
                                <div 
                                    key={course._id} 
                                    style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center",
                                        padding: "1rem", 
                                        background: "rgba(255,255,255,0.02)", 
                                        borderRadius: "8px", 
                                        border: "1px solid var(--border-color)" 
                                    }}
                                >
                                    <div>
                                        <div style={{ fontWeight: "600" }}>{course.code} - {course.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            Credits: {course.credits} • Semester: {course.semester}
                                        </div>
                                    </div>
                                    <Link to={`/courses/${course._id}`} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                        Manage
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Campus Announcements */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: "1.5rem" }}>Announcements Feed</h3>
                    {announcements.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No announcements.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {announcements.map(ann => (
                                <div key={ann._id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem" }}>
                                    <div style={{ fontWeight: "600", fontSize: "0.9rem", color: ann.priority === "high" ? "var(--error)" : "var(--text-main)" }}>
                                        {ann.title}
                                    </div>
                                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0" }}>{ann.content}</p>
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

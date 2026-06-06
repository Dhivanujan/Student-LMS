import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

const AdminDashboard = () => {
    const [metrics, setMetrics] = useState({ totalStudents: 0, totalLecturers: 0, totalCourses: 0, pendingEnrollments: 0, activityChart: [] });
    const [auditLogs, setAuditLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [metricsRes, logsRes] = await Promise.all([
                    api.get("/reports/admin"),
                    api.get("/users/audit-logs")
                ]);
                setMetrics(metricsRes.data.data);
                setAuditLogs(logsRes.data.data.slice(0, 5));
            } catch (err) {
                console.error("Failed to load admin dashboard metrics:", err);
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
            <h1 className="page-title">University Administration Portal</h1>
            <p className="page-subtitle">Oversee university departments, handle user enrollments, assign lecturers, and review audit trails.</p>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Registered Students</h3>
                    <div className="value">👥 {metrics.totalStudents}</div>
                    <Link to="/admin/users?role=student" className="link-alt" style={{ fontSize: "0.85rem" }}>Manage students</Link>
                </div>
                <div className="stat-card">
                    <h3>Total Faculty Lecturers</h3>
                    <div className="value">👨‍🏫 {metrics.totalLecturers}</div>
                    <Link to="/admin/users?role=lecturer" className="link-alt" style={{ fontSize: "0.85rem" }}>Manage lecturers</Link>
                </div>
                <div className="stat-card">
                    <h3>Active Course Sections</h3>
                    <div className="value">📚 {metrics.totalCourses}</div>
                    <Link to="/admin/courses" className="link-alt" style={{ fontSize: "0.85rem" }}>Manage course catalog</Link>
                </div>
                <div className="stat-card">
                    <h3>Pending Approvals</h3>
                    <div className="value" style={{ color: metrics.pendingEnrollments > 0 ? "var(--warning)" : "var(--success)" }}>
                        📝 {metrics.pendingEnrollments}
                    </div>
                    <Link to="/admin/enrollments" className="link-alt" style={{ fontSize: "0.85rem" }}>Review requests</Link>
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.2fr", gap: "2rem", marginTop: "2rem" }}>
                {/* Recent System Activities (Audit logs) */}
                <div className="glass-card">
                    <h3 style={{ marginBottom: "1.5rem" }}>Recent Audit Trails</h3>
                    {auditLogs.length === 0 ? (
                        <p style={{ color: "var(--text-muted)" }}>No activities recorded.</p>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {auditLogs.map(log => (
                                <div key={log._id} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.8rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                        <span className="badge" style={{ background: "var(--primary-glow)", color: "var(--text-main)", fontSize: "0.7rem" }}>
                                            {log.action}
                                        </span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", marginTop: "0.2rem" }}>{log.details}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                        Performer: {log.performerId?.name || "System"} ({log.performerId?.role || "System"}) • IP: {log.ipAddress}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dashboard Chart Mock & Export Utilities */}
                <div className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ marginBottom: "1rem" }}>System Reports & Actions</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                            Export structured reports of academic gradebooks, attendance logs, and rosters directly to CSV format.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <a 
                                href="http://localhost:5000/api/reports/export?type=grades" 
                                className="btn btn-outline" 
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <span>Export Student Grades Report</span>
                                <span>📥 CSV</span>
                            </a>
                            <a 
                                href="http://localhost:5000/api/reports/export?type=attendance" 
                                className="btn btn-outline" 
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <span>Export Attendance Registers</span>
                                <span>📥 CSV</span>
                            </a>
                            <a 
                                href="http://localhost:5000/api/reports/export?type=users" 
                                className="btn btn-outline" 
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            >
                                <span>Export Registered Users List</span>
                                <span>📥 CSV</span>
                            </a>
                        </div>
                    </div>

                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                            Note: All exports trigger direct downloads of live database snapshots.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

import { useState, useEffect } from "react";
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
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "500px", height: "1.2rem", marginBottom: "2rem" }}></div>

                <div className="stats-grid">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "140px" }}></div>
                    ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginTop: "2rem" }}>
                    <div className="glass-card-static skeleton-card" style={{ height: "350px" }}></div>
                    <div className="glass-card-static skeleton-card" style={{ height: "350px" }}></div>
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">University Administration Portal</h1>
            <p className="page-subtitle">Oversee university departments, handle user enrollments, assign lecturers, and review audit trails.</p>

            {/* Metrics Grid */}
            <div className="stats-grid">
                <div className="stat-card animate-slide-up stagger-1">
                    <div className="stat-card-header">
                        <h3>Total Registered Students</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(99, 102, 241, 0.15)", color: "#818cf8" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.totalStudents}</div>
                    <div className="stat-subtitle">Active learning accounts</div>
                    <Link to="/admin?tab=users" className="stat-link">
                        <span>Manage students</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>

                <div className="stat-card animate-slide-up stagger-2">
                    <div className="stat-card-header">
                        <h3>Total Faculty Lecturers</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(14, 165, 233, 0.15)", color: "#38bdf8" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.totalLecturers}</div>
                    <div className="stat-subtitle">Faculty members assigned</div>
                    <Link to="/admin?tab=users" className="stat-link">
                        <span>Manage lecturers</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>

                <div className="stat-card animate-slide-up stagger-3">
                    <div className="stat-card-header">
                        <h3>Active Course Sections</h3>
                        <div className="stat-card-icon" style={{ background: "rgba(168, 85, 247, 0.15)", color: "#c084fc" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <rect x="2" y="2" width="20" height="8" rx="2" ry="2"/>
                                <rect x="2" y="14" width="20" height="8" rx="2" ry="2"/>
                                <line x1="6" y1="6" x2="6.01" y2="6"/>
                                <line x1="6" y1="18" x2="6.01" y2="18"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value">{metrics.totalCourses}</div>
                    <div className="stat-subtitle">Active departments & classes</div>
                    <Link to="/admin?tab=courses" className="stat-link">
                        <span>Manage course catalog</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>

                <div className="stat-card animate-slide-up stagger-4">
                    <div className="stat-card-header">
                        <h3>Pending Approvals</h3>
                        <div className="stat-card-icon" style={{ 
                            background: metrics.pendingEnrollments > 0 ? "rgba(245, 158, 11, 0.15)" : "rgba(16, 185, 129, 0.15)",
                            color: metrics.pendingEnrollments > 0 ? "#fbbf24" : "#34d399"
                        }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                        </div>
                    </div>
                    <div className="value" style={{ color: metrics.pendingEnrollments > 0 ? "var(--warning)" : "var(--success)" }}>
                        {metrics.pendingEnrollments}
                    </div>
                    <div className="stat-subtitle">Requires registration review</div>
                    <Link to="/admin?tab=enrollments" className="stat-link">
                        <span>Review requests</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                            <polyline points="9 18 15 12 9 6"/>
                        </svg>
                    </Link>
                </div>
            </div>

            <div className="admin-grid-layout" style={{ marginTop: "2rem" }}>
                {/* Recent System Activities (Audit logs) */}
                <div className="glass-card-static animate-slide-up stagger-5" style={{ display: "flex", flexDirection: "column" }}>
                    <h3 style={{ marginBottom: "1.5rem" }}>Recent Audit Trails</h3>
                    {auditLogs.length === 0 ? (
                        <div className="empty-state" style={{ padding: "3rem 1rem", flex: 1 }}>
                            <div className="empty-state-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="12" r="10"/>
                                    <line x1="12" y1="8" x2="12" y2="12"/>
                                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                                </svg>
                            </div>
                            <div className="empty-state-title">No activities recorded</div>
                            <div className="empty-state-text">System events will appear here once users perform actions.</div>
                        </div>
                    ) : (
                        <div className="timeline" style={{ display: "flex", flexDirection: "column", gap: "1.2rem", position: "relative", paddingLeft: "1.5rem", borderLeft: "2px solid var(--border-color)", marginLeft: "0.5rem", flex: 1 }}>
                            {auditLogs.map(log => (
                                <div key={log._id} style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                                    {/* Timeline Dot */}
                                    <div style={{ position: "absolute", left: "-30px", top: "4px", width: "10px", height: "10px", borderRadius: "50%", background: "var(--role-accent)", border: "2px solid var(--background-dark)" }}></div>
                                    
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span className="badge" style={{ background: "var(--primary-glow)", border: "1px solid var(--border-color)", color: "var(--text-main)", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: "600", padding: "0.2rem 0.5rem" }}>
                                            {log.action}
                                        </span>
                                        <span style={{ color: "var(--text-muted)", fontSize: "0.75rem" }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "0.85rem", color: "var(--text-main)", marginTop: "0.1rem" }}>{log.details}</div>
                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                                        <span>Performer: <strong style={{ color: "var(--text-main)" }}>{log.performerId?.name || "System"}</strong> ({log.performerId?.role || "System"})</span>
                                        <span style={{ opacity: 0.5 }}>•</span>
                                        <span>IP: {log.ipAddress}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Dashboard Chart Mock & Export Utilities */}
                <div className="glass-card-static animate-slide-up stagger-6" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                        <h3 style={{ marginBottom: "1rem" }}>System Reports & Actions</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", marginBottom: "2rem", lineHeight: "1.5" }}>
                            Export structured reports of academic gradebooks and user databases directly to CSV formats.
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            <a 
                                href="http://localhost:5000/api/reports/export?type=grades" 
                                className="btn btn-outline" 
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", padding: "0.75rem 1rem" }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                    </svg>
                                    Export Student Grades Report
                                </span>
                                <span className="badge badge-student" style={{ fontSize: "0.7rem", fontWeight: "700" }}>CSV</span>
                            </a>
                            <a 
                                href="http://localhost:5000/api/reports/export?type=users" 
                                className="btn btn-outline" 
                                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none", padding: "0.75rem 1rem" }}
                            >
                                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                    </svg>
                                    Export Registered Users List
                                </span>
                                <span className="badge badge-student" style={{ fontSize: "0.7rem", fontWeight: "700" }}>CSV</span>
                            </a>
                        </div>
                    </div>

                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                        <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px", flexShrink: 0 }}>
                                <circle cx="12" cy="12" r="10"/>
                                <line x1="12" y1="16" x2="12" y2="12"/>
                                <line x1="12" y1="8" x2="12.01" y2="8"/>
                            </svg>
                            Note: All exports trigger direct downloads of live database snapshots.
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

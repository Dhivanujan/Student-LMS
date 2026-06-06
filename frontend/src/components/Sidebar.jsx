import { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    // Helper to get first initial
    const firstInitial = user.name ? user.name.charAt(0).toUpperCase() : "U";

    return (
        <aside className="sidebar">
            <div className="sidebar-nav">
                <div className="sidebar-section-label">Main</div>
                <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="3" width="7" height="7" rx="1"/>
                        <rect x="14" y="14" width="7" height="7" rx="1"/>
                        <rect x="3" y="14" width="7" height="7" rx="1"/>
                    </svg>
                    <span>Dashboard</span>
                </NavLink>

                {user.role === "student" && (
                    <>
                        <div className="sidebar-section-label">Learning</div>
                        <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                            <span>My Enrolled Courses</span>
                        </NavLink>
                        <NavLink to="/catalog" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                            </svg>
                            <span>Browse Catalog</span>
                        </NavLink>
                    </>
                )}

                {user.role === "lecturer" && (
                    <>
                        <div className="sidebar-section-label">Teaching</div>
                        <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                            <span>My Taught Courses</span>
                        </NavLink>
                    </>
                )}

                {user.role === "admin" && (
                    <>
                        <div className="sidebar-section-label">Management</div>
                        <NavLink to="/admin?tab=users" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                <circle cx="9" cy="7" r="4"/>
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                            <span>Manage Users</span>
                        </NavLink>
                        <NavLink to="/admin?tab=courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                            </svg>
                            <span>Manage Courses</span>
                        </NavLink>
                        <NavLink to="/admin?tab=enrollments" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            </svg>
                            <span>Course Enrollments</span>
                        </NavLink>
                        <NavLink to="/admin?tab=faculties" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                                <line x1="9" y1="22" x2="9" y2="16"/>
                                <line x1="15" y1="22" x2="15" y2="16"/>
                                <line x1="9" y1="16" x2="15" y2="16"/>
                                <path d="M8 6h2v2H8V6zm0 4h2v2H8v-2zm8-4h2v2h-2V6zm0 4h2v2h-2v-2z"/>
                            </svg>
                            <span>Academic Units</span>
                        </NavLink>
                        <NavLink to="/admin?tab=audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                            <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                            </svg>
                            <span>System Logs</span>
                        </NavLink>
                    </>
                )}

                <div className="sidebar-section-label">Account</div>
                <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                    <svg className="sidebar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>My Profile</span>
                </NavLink>
            </div>

            <div className="sidebar-user">
                <div className="sidebar-user-card">
                    {user.profilePicture ? (
                        <img 
                            src={`http://localhost:5000${user.profilePicture}`} 
                            alt={user.name} 
                            className="sidebar-user-avatar"
                            style={{ objectFit: "cover" }}
                        />
                    ) : (
                        <div className="sidebar-user-avatar">
                            {firstInitial}
                        </div>
                    )}
                    <div className="sidebar-user-info" style={{ marginLeft: "0.75rem", minWidth: 0, flex: 1 }}>
                        <div className="sidebar-user-name" style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                            {user.name}
                        </div>
                        <div className="sidebar-user-role">
                            {user.role}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;

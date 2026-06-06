import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
    const { user } = useContext(AuthContext);

    if (!user) return null;

    return (
        <aside className="sidebar">
            <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                <span>📊</span> Dashboard
            </NavLink>

            {user.role === "student" && (
                <>
                    <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>🎓</span> My Enrolled Courses
                    </NavLink>
                    <NavLink to="/catalog" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>🔍</span> Browse Catalog
                    </NavLink>
                </>
            )}

            {user.role === "lecturer" && (
                <>
                    <NavLink to="/courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>📖</span> My Taught Courses
                    </NavLink>
                </>
            )}

            {user.role === "admin" && (
                <>
                    <NavLink to="/admin?tab=users" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>👥</span> Manage Users
                    </NavLink>
                    <NavLink to="/admin?tab=courses" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>📚</span> Manage Courses
                    </NavLink>
                    <NavLink to="/admin?tab=enrollments" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>📝</span> Course Enrollments
                    </NavLink>
                    <NavLink to="/admin?tab=faculties" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>🏢</span> Academic Units
                    </NavLink>
                    <NavLink to="/admin?tab=audit-logs" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}>
                        <span>📁</span> System Logs
                    </NavLink>
                </>
            )}

            <NavLink to="/profile" className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`} style={{ marginTop: "auto" }}>
                <span>👤</span> My Profile
            </NavLink>
        </aside>
    );
};

export default Sidebar;

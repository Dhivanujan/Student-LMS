// ============================================
// NAVBAR COMPONENT - Application Navigation
// ============================================

import React, { useContext } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <NavLink to="/dashboard" className="logo">
                    EduManage
                </NavLink>

                <ul className="nav-links">
                    <li>
                        <NavLink 
                            to="/dashboard" 
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            Dashboard
                        </NavLink>
                    </li>
                    
                    <li>
                        <NavLink 
                            to="/courses" 
                            className={({ isActive }) => (isActive ? "active" : "")}
                        >
                            Courses
                        </NavLink>
                    </li>

                    {/* Show Admin Panel link only to Admin accounts */}
                    {user?.role === "admin" && (
                        <li>
                            <NavLink 
                                to="/admin" 
                                className={({ isActive }) => (isActive ? "active" : "")}
                            >
                                Admin Panel
                            </NavLink>
                        </li>
                    )}

                    {user && (
                        <li style={{ display: "flex", alignItems: "center", gap: "1rem", marginLeft: "1.5rem" }}>
                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)" }}>
                                Hi, <strong style={{ color: "var(--text-main)" }}>{user.name}</strong>
                                <span className={`badge badge-${user.role}`} style={{ marginLeft: "0.5rem" }}>
                                    {user.role}
                                </span>
                            </span>
                            
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "0.45rem 0.9rem", fontSize: "0.85rem" }}>
                                Logout
                            </button>
                        </li>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;

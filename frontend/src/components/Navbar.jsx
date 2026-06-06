import React, { useContext, useState, useEffect, useRef } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDrawer, setShowDrawer] = useState(false);
    
    const drawerRef = useRef(null);

    // Load user notifications
    useEffect(() => {
        let isMounted = true;
        
        const fetchNotifications = async () => {
            if (!user) return;
            try {
                const response = await api.get("/notifications");
                if (isMounted) {
                    setNotifications(response.data.data);
                    setUnreadCount(response.data.data.filter(n => !n.read).length);
                }
            } catch (err) {
                console.error("Failed to load notifications:", err.message);
            }
        };

        fetchNotifications();
        
        // Poll every 30s
        const interval = setInterval(fetchNotifications, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [user]);

    // Handle click outside drawer to close
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (drawerRef.current && !drawerRef.current.contains(e.target)) {
                setShowDrawer(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleMarkAllRead = async () => {
        try {
            await api.put("/notifications");
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <nav className="navbar" style={{ height: "70px", display: "flex", alignItems: "center" }}>
            <div className="container nav-container">
                <NavLink to="/dashboard" className="logo">
                    🎓 UniLMS
                </NavLink>

                {user && (
                    <div style={{ display: "flex", alignItems: "center", gap: "1.8rem" }}>
                        
                        {/* Notification Bell */}
                        <div className="notification-bell-container" ref={drawerRef} onClick={() => setShowDrawer(!showDrawer)}>
                            <span style={{ fontSize: "1.4rem" }}>🔔</span>
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}

                            {showDrawer && (
                                <div className="notification-drawer" onClick={(e) => e.stopPropagation()}>
                                    <div style={{ padding: "0.8rem 1rem", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <h4 style={{ margin: 0 }}>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="link-alt" style={{ border: "none", background: "none", fontSize: "0.75rem", cursor: "pointer" }}>
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        {notifications.length === 0 ? (
                                            <p style={{ padding: "1.5rem", textAlign: "center", color: "var(--text-muted)", margin: 0 }}>
                                                No notifications
                                            </p>
                                        ) : (
                                            notifications.map(n => (
                                                <div 
                                                    key={n._id} 
                                                    className={`notification-item ${!n.read ? "unread" : ""}`}
                                                    onClick={() => !n.read && handleMarkRead(n._id)}
                                                >
                                                    <div style={{ fontWeight: !n.read ? "600" : "400" }}>{n.title}</div>
                                                    <div style={{ color: "var(--text-muted)", fontSize: "0.8rem", marginTop: "0.2rem" }}>{n.message}</div>
                                                    <div className="time">{new Date(n.createdAt).toLocaleTimeString()}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Summary & Logout */}
                        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                            {user.profilePicture ? (
                                <img 
                                    src={`http://localhost:5000${user.profilePicture}`} 
                                    alt={user.name} 
                                    style={{ width: "35px", height: "35px", borderRadius: "50%", objectFit: "cover", border: "1.5px solid var(--primary)" }}
                                />
                            ) : (
                                <div style={{ width: "35px", height: "35px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: "600" }}>
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", display: "flex", flexDirection: "column" }}>
                                <span style={{ color: "var(--text-main)", fontWeight: "600" }}>{user.name}</span>
                                <span style={{ fontSize: "0.75rem" }} className={`badge badge-${user.role}`}>
                                    {user.role}
                                </span>
                            </span>
                            
                            <button onClick={handleLogout} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                Logout
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

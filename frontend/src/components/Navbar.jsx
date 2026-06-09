import { useContext, useState, useEffect, useRef } from "react";
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

    const toggleMobileMenu = () => {
        const sidebar = document.querySelector(".sidebar");
        if (sidebar) {
            sidebar.classList.toggle("sidebar-open");
            // Manage backdrop
            let backdrop = document.querySelector(".sidebar-backdrop");
            if (sidebar.classList.contains("sidebar-open")) {
                if (!backdrop) {
                    backdrop = document.createElement("div");
                    backdrop.className = "sidebar-backdrop";
                    backdrop.addEventListener("click", () => {
                        sidebar.classList.remove("sidebar-open");
                        backdrop.remove();
                    });
                    document.body.appendChild(backdrop);
                }
            } else {
                if (backdrop) backdrop.remove();
            }
        }
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                {user && (
                    <button className="mobile-menu-btn" onClick={toggleMobileMenu} aria-label="Toggle Menu">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="3" y1="12" x2="21" y2="12"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <line x1="3" y1="18" x2="21" y2="18"/>
                        </svg>
                    </button>
                )}

                <NavLink to="/dashboard" className="logo" style={{ display: "flex", alignItems: "center", gap: "0.75rem", textDecoration: "none" }}>
                    <svg viewBox="0 0 100 110" width="32" height="35" className="oxford-crest-svg" style={{ fill: "none", stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "round", flexShrink: 0 }}>
                        <path d="M10,10 L90,10 C90,10 90,65 50,100 C10,65 10,10 10,10 Z" fill="#002147" stroke="#C5A059" strokeWidth="3"/>
                        <path d="M30,55 C35,51 45,51 50,55 C55,51 65,51 70,55 L70,35 C65,31 55,31 50,35 C45,31 35,31 30,35 Z" fill="#FFFFFF" stroke="#002147" strokeWidth="1.5"/>
                        <line x1="50" y1="35" x2="50" y2="55" stroke="#002147" strokeWidth="1.5"/>
                        <line x1="35" y1="39" x2="45" y2="39" stroke="#002147" strokeWidth="1"/>
                        <line x1="35" y1="44" x2="45" y2="44" stroke="#002147" strokeWidth="1"/>
                        <line x1="35" y1="49" x2="43" y2="49" stroke="#002147" strokeWidth="1"/>
                        <line x1="55" y1="39" x2="65" y2="39" stroke="#002147" strokeWidth="1"/>
                        <line x1="55" y1="44" x2="65" y2="44" stroke="#002147" strokeWidth="1"/>
                        <line x1="55" y1="49" x2="63" y2="49" stroke="#002147" strokeWidth="1"/>
                        <path d="M22,23 L28,23 L29,20 L27,21 L25,18 L23,21 L21,20 Z" fill="#C5A059" stroke="#C5A059" strokeWidth="0.5"/>
                        <path d="M72,23 L78,23 L79,20 L77,21 L75,18 L73,21 L71,20 Z" fill="#C5A059" stroke="#C5A059" strokeWidth="0.5"/>
                        <path d="M47,73 L53,73 L54,70 L52,71 L50,68 L48,71 L46,70 Z" fill="#C5A059" stroke="#C5A059" strokeWidth="0.5"/>
                    </svg>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: "800", fontSize: "1.35rem", letterSpacing: "-0.02em", color: "var(--primary)", display: "flex", alignItems: "center" }}>
                        SVIAS&nbsp;<span style={{ color: "var(--accent)", fontWeight: "500" }}>Canvas</span>
                    </span>
                </NavLink>

                {user && (
                    <div className="nav-right">
                        
                        {/* Notification Bell */}
                        <div className="notification-bell-container" ref={drawerRef}>
                            <button 
                                className={`notification-bell ${unreadCount > 0 ? "has-unread" : ""}`}
                                onClick={() => setShowDrawer(!showDrawer)}
                                aria-label="Notifications"
                            >
                                <svg className="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                {unreadCount > 0 && (
                                    <span className="notification-badge">{unreadCount}</span>
                                )}
                            </button>

                            {showDrawer && (
                                <div className="notification-drawer">
                                    <div className="notification-drawer-header">
                                        <h4>Notifications</h4>
                                        {unreadCount > 0 && (
                                            <button onClick={handleMarkAllRead} className="link-alt">
                                                Mark all read
                                            </button>
                                        )}
                                    </div>
                                    <div className="notification-drawer-body">
                                        {notifications.length === 0 ? (
                                            <p className="empty-state-text" style={{ padding: "2rem", textAlign: "center", margin: 0 }}>
                                                No notifications
                                            </p>
                                        ) : (
                                            notifications.map(n => (
                                                <div 
                                                    key={n._id} 
                                                    className={`notification-item ${!n.read ? "unread" : ""}`}
                                                    onClick={() => !n.read && handleMarkRead(n._id)}
                                                >
                                                    <div className="notification-item-content">
                                                        <div className="notification-item-title">{n.title}</div>
                                                        <div className="notification-item-message">{n.message}</div>
                                                        <div className="time">{new Date(n.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Summary & Logout */}
                        <div className="nav-user">
                            {user.profilePicture ? (
                                <img 
                                    src={`http://localhost:5000${user.profilePicture}`} 
                                    alt={user.name} 
                                    className="nav-user-avatar"
                                    style={{ objectFit: "cover" }}
                                />
                            ) : (
                                <div className="nav-user-avatar">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                            )}

                            <span className="nav-user-info">
                                <span className="nav-user-name">{user.name}</span>
                                <span className="nav-user-role">{user.role}</span>
                            </span>
                            
                            <button onClick={handleLogout} className="nav-logout-btn" title="Logout">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

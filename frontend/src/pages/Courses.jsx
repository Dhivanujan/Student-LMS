import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Courses = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                if (user.role === "student") {
                    const response = await api.get("/enrollments/student/me");
                    setCourses(response.data.data);
                } else if (user.role === "lecturer") {
                    const response = await api.get(`/courses?lecturerId=${user.id}`);
                    setCourses(response.data.data);
                } else if (user.role === "admin") {
                    const response = await api.get("/courses");
                    setCourses(response.data.data);
                }
            } catch (err) {
                console.error("Failed to load courses:", err);
                setError("Could not load courses.");
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchCourses();
    }, [user]);

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "500px", height: "1.2rem", marginBottom: "2rem" }}></div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="skeleton skeleton-card" style={{ height: "260px", borderRadius: "16px" }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in">
            <h1 className="page-title">
                {user.role === "student" ? "My Enrolled Courses" : user.role === "lecturer" ? "My Assigned Courses" : "All Academic Courses"}
            </h1>
            <p className="page-subtitle">Select a course to view materials, assignments, quizzes, and participate in discussion threads.</p>

            {error && <div className="alert alert-danger animate-fade-in">{error}</div>}

            {courses.length === 0 ? (
                <div className="empty-state animate-slide-up" style={{ padding: "4rem 2rem" }}>
                    <div className="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20M4 19.5V3.5A2.5 2.5 0 0 1 6.5 1H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5z"/>
                        </svg>
                    </div>
                    <div className="empty-state-title">No active courses found</div>
                    <div className="empty-state-text">
                        {user.role === "student" ? "You have not enrolled in any courses yet." : "You have not been assigned to teach any courses."}
                    </div>
                    {user.role === "student" && (
                        <Link to="/catalog" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                            Browse Catalogue
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {courses.map((course, index) => (
                        <div 
                            key={course._id} 
                            className="course-card animate-slide-up" 
                            style={{ 
                                animationDelay: `${index * 0.05}s`,
                                display: "flex", 
                                flexDirection: "column"
                            }}
                        >
                            <div className="course-card-gradient"></div>
                            <div className="course-card-body" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                                <div>
                                    <span className="course-card-code">{course.code}</span>
                                    <h3 className="course-card-title" style={{ marginTop: "0.5rem" }}>{course.name}</h3>
                                    <p className="course-card-desc" style={{ marginTop: "0.5rem", flexGrow: 1 }}>
                                        {course.description ? (course.description.substring(0, 120) + (course.description.length > 120 ? "..." : "")) : "No description provided."}
                                    </p>
                                </div>
                                <div className="course-card-meta" style={{ marginTop: "1.5rem" }}>
                                    <div className="course-card-meta-item">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                        <span>Sem: {course.semester}</span>
                                    </div>
                                    {user.role !== "lecturer" && (
                                        <div className="course-card-meta-item">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            <span style={{ textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "150px" }}>
                                                {course.lecturerId?.name || "Not Assigned"}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="course-card-footer" style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                                <Link to={`/courses/${course._id}`} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                                    <span>Open Course Workspace</span>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;

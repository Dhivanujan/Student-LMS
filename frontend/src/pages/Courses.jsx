import React, { useState, useEffect, useContext } from "react";
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

    if (loading) return <div className="text-center">Loading courses list...</div>;

    return (
        <div>
            <h1 className="page-title">
                {user.role === "student" ? "My Enrolled Courses" : user.role === "lecturer" ? "My Assigned Courses" : "All Academic Courses"}
            </h1>
            <p className="page-subtitle">Select a course to view materials, assignments, quizzes, and participate in discussion threads.</p>

            {error && <div className="alert alert-danger">{error}</div>}

            {courses.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "4rem 2rem" }}>
                    <h3>No active courses found</h3>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
                        {user.role === "student" ? "You have not enrolled in any courses yet." : "You have not been assigned to teach any courses."}
                    </p>
                    {user.role === "student" && (
                        <Link to="/catalog" className="btn btn-primary">
                            Browse Catalogue
                        </Link>
                    )}
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {courses.map(course => (
                        <div key={course._id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                            <div>
                                <span style={{ fontSize: "0.75rem", background: "var(--primary-glow)", padding: "0.3rem 0.6rem", borderRadius: "4px", fontWeight: "600", marginBottom: "0.5rem", display: "inline-block" }}>
                                    {course.code}
                                </span>
                                <h3 style={{ marginBottom: "0.8rem", fontSize: "1.2rem" }}>{course.name}</h3>
                                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                                    {course.description.substring(0, 120)}...
                                </p>
                                <div style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                                    <strong>Semester:</strong> {course.semester} <br />
                                    {user.role !== "lecturer" && (
                                        <><strong>Lecturer:</strong> {course.lecturerId?.name || "Not Assigned"}</>
                                    )}
                                </div>
                            </div>

                            <Link to={`/courses/${course._id}`} className="btn btn-primary" style={{ width: "100%", textAlign: "center" }}>
                                Open Course Workspace
                            </Link>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Courses;

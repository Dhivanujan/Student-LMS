// ============================================
// DASHBOARD PAGE COMPONENT
// ============================================

import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    const fetchDashboardData = async () => {
        try {
            // Fetch all courses to filter enrolled ones
            const response = await api.get("/courses");
            const allCourses = response.data.data;

            // Filter courses where this student's ID is in the enrolledStudents array
            const enrolled = allCourses.filter((course) => {
                return course.enrolledStudents.some(
                    (student) => student._id === user.id || student === user.id
                );
            });

            setMyCourses(enrolled);
        } catch (err) {
            console.error("Dashboard Fetch Error:", err);
            setError("Failed to load dashboard data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const handleUnenroll = async (courseId) => {
        setError(null);
        setSuccessMsg(null);
        if (!window.confirm("Are you sure you want to cancel your enrollment in this course?")) {
            return;
        }

        try {
            const response = await api.post(`/courses/${courseId}/unenroll`);
            setSuccessMsg(response.data.message || "Enrollment canceled successfully!");
            // Reload dashboard data
            fetchDashboardData();
        } catch (err) {
            console.error("Unenrollment error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Unenrollment failed.";
            setError(msg);
        }
    };

    if (loading) {
        return (
            <div className="container flex-center" style={{ minHeight: "60vh" }}>
                <p>Loading your dashboard details...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "2rem 0" }}>
            {/* Welcoming Banner card */}
            <div className="glass-card" style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1.5rem" }}>
                <div>
                    <h1 className="page-title">Welcome back, {user?.name}!</h1>
                    <p style={{ color: "var(--text-muted)" }}>
                        Logged in as: <strong style={{ color: "var(--text-main)" }}>{user?.email}</strong>
                    </p>
                </div>
                <div>
                    <span className={`badge badge-${user?.role}`} style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>
                        Role: {user?.role}
                    </span>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {user?.role === "student" ? (
                <div>
                    <h2 style={{ fontSize: "1.6rem", marginBottom: "1rem" }}>Your Enrolled Courses</h2>
                    
                    {myCourses.length === 0 ? (
                        <div className="glass-card text-center" style={{ padding: "3rem" }}>
                            <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>
                                You are not enrolled in any courses yet.
                            </p>
                            <Link to="/courses" className="btn btn-primary">
                                Explore Courses & Enroll
                            </Link>
                        </div>
                    ) : (
                        <div className="grid-courses">
                            {myCourses.map((course) => (
                                <CourseCard 
                                    key={course._id} 
                                    course={course} 
                                    user={user} 
                                    isEnrolled={true} 
                                    onUnenroll={handleUnenroll}
                                />
                            ))}
                        </div>
                    )}
                </div>
            ) : (
                // Admin View
                <div className="glass-card" style={{ padding: "3rem" }}>
                    <h2 style={{ marginBottom: "1rem" }}>Administrator Console</h2>
                    <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                        You have global administrator access. Use the courses panel to manage courses, or proceed to the Admin Panel to add and delete academic courses.
                    </p>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <Link to="/admin" className="btn btn-primary">
                            Go to Admin Panel
                        </Link>
                        <Link to="/courses" className="btn btn-outline">
                            View All Courses
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;

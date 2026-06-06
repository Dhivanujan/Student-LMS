// ============================================
// COURSES PAGE COMPONENT - View & Search
// ============================================

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

const Courses = () => {
    const { user } = useContext(AuthContext);
    
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    // 1. Fetch all courses from the backend
    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses");
            setCourses(response.data.data);
        } catch (err) {
            console.error("Fetch Courses Error:", err);
            setError("Failed to fetch courses. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // 2. Handle course enrollment
    const handleEnroll = async (courseId) => {
        setError(null);
        setSuccessMsg(null);
        try {
            const response = await api.post(`/courses/${courseId}/enroll`);
            setSuccessMsg(response.data.message || "Enrolled in course successfully!");
            
            // Reload courses list to reflect updated capacity state
            fetchCourses();
        } catch (err) {
            console.error("Enrollment error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Enrollment failed.";
            setError(msg);
        }
    };

    // Handle course unenrollment
    const handleUnenroll = async (courseId) => {
        setError(null);
        setSuccessMsg(null);
        if (!window.confirm("Are you sure you want to cancel your enrollment in this course?")) {
            return;
        }

        try {
            const response = await api.post(`/courses/${courseId}/unenroll`);
            setSuccessMsg(response.data.message || "Enrollment canceled successfully!");
            
            // Reload courses list to reflect updated capacity state
            fetchCourses();
        } catch (err) {
            console.error("Unenrollment error:", err);
            const msg = err.response?.data?.message || err.response?.data?.error || "Unenrollment failed.";
            setError(msg);
        }
    };

    // 3. Filter courses dynamically based on search query
    const filteredCourses = courses.filter((course) => {
        const query = searchQuery.toLowerCase();
        return (
            course.title.toLowerCase().includes(query) ||
            course.instructor.toLowerCase().includes(query) ||
            course.description.toLowerCase().includes(query)
        );
    });

    if (loading) {
        return (
            <div className="container flex-center" style={{ minHeight: "60vh" }}>
                <p>Loading course catalogue...</p>
            </div>
        );
    }

    return (
        <div className="container" style={{ padding: "2rem 0" }}>
            <h1 className="page-title">Course Catalogue</h1>
            <p className="page-subtitle">Explore available academic courses and enroll in your favorites.</p>

            {/* Notifications panel */}
            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {/* Filter Search Input */}
            <div style={{ marginBottom: "2.5rem" }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search courses by title, instructor, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ fontSize: "1.05rem", padding: "1rem 1.5rem" }}
                />
            </div>

            {filteredCourses.length === 0 ? (
                <div className="glass-card text-center" style={{ padding: "4rem 2rem" }}>
                    <h3>No courses found</h3>
                    <p style={{ color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        Try searching for a different keyword or course name.
                    </p>
                </div>
            ) : (
                <div className="grid-courses">
                    {filteredCourses.map((course) => {
                        // Check if student is already enrolled in this course
                        const isEnrolled = course.enrolledStudents?.some(
                            (student) => student._id === user.id || student === user.id
                        );

                        return (
                            <CourseCard
                                key={course._id}
                                course={course}
                                user={user}
                                onEnroll={handleEnroll}
                                onUnenroll={handleUnenroll}
                                isEnrolled={isEnrolled}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Courses;

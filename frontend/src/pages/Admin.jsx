// ============================================
// ADMIN CONTROL PANEL COMPONENT
// ============================================

import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import CourseCard from "../components/CourseCard";

const Admin = () => {
    const { user } = useContext(AuthContext);

    // Course List State
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form inputs state
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instructor, setInstructor] = useState("");
    const [duration, setDuration] = useState("");
    const [capacity, setCapacity] = useState(30);

    // Notification feedback state
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // 1. Fetch courses to show admin
    const fetchCourses = async () => {
        try {
            const response = await api.get("/courses");
            setCourses(response.data.data);
        } catch (err) {
            console.error("Admin Fetch Courses Error:", err);
            setError("Failed to fetch course data.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    // 2. Submit form to create a new course
    const handleAddCourse = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccessMsg(null);

        // Inputs client validation check
        if (!title || !description || !instructor || !duration || !capacity) {
            setError("Please fill in all course parameters");
            return;
        }

        setSubmitting(true);
        try {
            const response = await api.post("/courses", {
                title,
                description,
                instructor,
                duration,
                capacity: parseInt(capacity, 10)
            });

            setSuccessMsg(response.data.message || "Course added successfully!");
            
            // Clear form inputs
            setTitle("");
            setDescription("");
            setInstructor("");
            setDuration("");
            setCapacity(30);

            // Reload courses list
            fetchCourses();
        } catch (err) {
            console.error("Add Course Error:", err);
            const msg = err.response?.data?.message || "Failed to create course. Try another title.";
            setError(msg);
        } finally {
            setSubmitting(false);
        }
    };

    // 3. Delete an existing course
    const handleDeleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course? All student enrollments for this course will be deleted.")) {
            return;
        }

        setError(null);
        setSuccessMsg(null);
        try {
            const response = await api.delete(`/courses/${courseId}`);
            setSuccessMsg(response.data.message || "Course deleted successfully!");
            
            // Reload courses list
            fetchCourses();
        } catch (err) {
            console.error("Delete Course Error:", err);
            setError("Failed to delete course. Please try again.");
        }
    };

    return (
        <div className="container" style={{ padding: "2rem 0" }}>
            <h1 className="page-title">Admin Dashboard</h1>
            <p className="page-subtitle">Configure, add, or remove courses in the registry catalog.</p>

            {/* Notification messages */}
            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div style={{ display: "flex", gap: "2.5rem", flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start" }}>
                {/* Add New Course Form panel */}
                <div className="glass-card" style={{ flex: "1 1 380px", position: "sticky", top: "100px" }}>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Add New Course</h2>
                    <form onSubmit={handleAddCourse}>
                        <div className="form-group">
                            <label htmlFor="course-title">Course Title</label>
                            <input
                                type="text"
                                id="course-title"
                                className="form-input"
                                placeholder="e.g. Data Structures & Algorithms"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="course-desc">Course Description</label>
                            <textarea
                                id="course-desc"
                                className="form-input"
                                placeholder="Describe the course goals..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                style={{ minHeight: "90px", resize: "vertical" }}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="course-inst">Instructor Name</label>
                            <input
                                type="text"
                                id="course-inst"
                                className="form-input"
                                placeholder="e.g. Prof. Alan Turing"
                                value={instructor}
                                onChange={(e) => setInstructor(e.target.value)}
                            />
                        </div>

                        <div style={{ display: "flex", gap: "1rem" }}>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="course-dur">Duration</label>
                                <input
                                    type="text"
                                    id="course-dur"
                                    className="form-input"
                                    placeholder="e.g. 12 weeks"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                            <div className="form-group" style={{ flex: 1 }}>
                                <label htmlFor="course-cap">Capacity</label>
                                <input
                                    type="number"
                                    id="course-cap"
                                    className="form-input"
                                    placeholder="30"
                                    value={capacity}
                                    onChange={(e) => setCapacity(e.target.value)}
                                    min="1"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="btn btn-primary"
                            style={{ width: "100%", marginTop: "1rem" }}
                        >
                            {submitting ? "Creating Course..." : "Add Course"}
                        </button>
                    </form>
                </div>

                {/* Manage Existing Courses panel */}
                <div style={{ flex: "2 1 600px" }}>
                    <h2 style={{ fontSize: "1.4rem", marginBottom: "1.5rem" }}>Existing Courses</h2>

                    {loading ? (
                        <p>Loading course listing...</p>
                    ) : courses.length === 0 ? (
                        <div className="glass-card text-center" style={{ padding: "3rem" }}>
                            <p style={{ color: "var(--text-muted)" }}>No courses exist in the database catalog.</p>
                        </div>
                    ) : (
                        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}>
                            {courses.map((course) => (
                                <CourseCard
                                    key={course._id}
                                    course={course}
                                    user={user}
                                    onDelete={handleDeleteCourse}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Admin;

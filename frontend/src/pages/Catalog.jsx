import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const Catalog = () => {
    const { user } = useContext(AuthContext);
    const [courses, setCourses] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const fetchData = async () => {
        try {
            const [coursesRes, requestsRes] = await Promise.all([
                api.get("/courses"),
                api.get("/enrollments")
            ]);
            setCourses(coursesRes.data.data);
            
            // Filter requests by me
            const myReqs = requestsRes.data.data.filter(r => r.studentId?._id === user.id);
            setMyRequests(myReqs);
        } catch (err) {
            console.error("Failed to load catalog data:", err);
            setError("Failed to fetch available courses.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRequestEnrollment = async (courseId) => {
        setError(null);
        setSuccessMsg(null);
        try {
            const response = await api.post("/enrollments/request", { courseId });
            setSuccessMsg(response.data.message || "Enrollment request submitted successfully!");
            fetchData();
        } catch (err) {
            console.error("Enrollment request error:", err);
            setError(err.response?.data?.message || "Failed to submit request.");
        }
    };

    const getEnrollmentStatus = (courseId) => {
        const match = myRequests.find(r => r.courseId?._id === courseId);
        return match ? match.status : null; // returns 'pending', 'approved', 'rejected' or null
    };

    const filteredCourses = courses.filter(c => {
        const query = searchQuery.toLowerCase();
        return c.name.toLowerCase().includes(query) || c.code.toLowerCase().includes(query) || c.description.toLowerCase().includes(query);
    });

    if (loading) return <div className="text-center">Loading course catalogue...</div>;

    return (
        <div>
            <h1 className="page-title">University Course Catalogue</h1>
            <p className="page-subtitle">Browse all available courses, review descriptors, and request enrollment access.</p>

            {error && <div className="alert alert-danger">{error}</div>}
            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            <div style={{ marginBottom: "2rem" }}>
                <input
                    type="text"
                    className="form-input"
                    placeholder="🔍 Search by course name, code, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {filteredCourses.length === 0 ? (
                <div className="glass-card text-center">No courses found matching that criteria.</div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {filteredCourses.map(course => {
                        const status = getEnrollmentStatus(course._id);
                        return (
                            <div key={course._id} className="glass-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                                <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                        <span style={{ fontSize: "0.75rem", background: "var(--primary-glow)", padding: "0.3rem 0.6rem", borderRadius: "4px", fontWeight: "600" }}>
                                            {course.code}
                                        </span>
                                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                            {course.credits} Credits
                                        </span>
                                    </div>
                                    <h3 style={{ marginBottom: "0.8rem", fontSize: "1.2rem" }}>{course.name}</h3>
                                    <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                                        {course.description.substring(0, 120)}...
                                    </p>
                                    <div style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>
                                        <strong>Department:</strong> {course.departmentId?.name || "N/A"} <br />
                                        <strong>Lecturer:</strong> {course.lecturerId?.name || "Not Assigned"} <br />
                                        <strong>Semester:</strong> {course.semester}
                                    </div>
                                </div>

                                <div>
                                    {status === "approved" ? (
                                        <div className="badge badge-student" style={{ width: "100%", padding: "0.6rem", justifyContent: "center" }}>Enrolled</div>
                                    ) : status === "pending" ? (
                                        <button className="btn btn-outline" disabled style={{ width: "100%", cursor: "not-allowed" }}>
                                            Pending Approval ⌛
                                        </button>
                                    ) : status === "rejected" ? (
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <span className="badge badge-admin" style={{ flex: 1, padding: "0.6rem", justifyContent: "center", background: "rgba(239, 68, 68, 0.15)", color: "var(--error)" }}>Rejected</span>
                                            <button onClick={() => handleRequestEnrollment(course._id)} className="btn btn-primary" style={{ padding: "0.6rem 1rem", fontSize: "0.8rem" }}>Re-apply</button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleRequestEnrollment(course._id)} className="btn btn-primary" style={{ width: "100%" }}>
                                            Request Enrollment
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Catalog;

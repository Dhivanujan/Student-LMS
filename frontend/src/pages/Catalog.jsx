import { useState, useEffect, useContext, useCallback } from "react";
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

    const fetchData = useCallback(async () => {
        try {
            const [coursesRes, requestsRes] = await Promise.all([
                api.get("/courses"),
                api.get("/enrollments")
            ]);
            setCourses(coursesRes.data.data);
            
            // Filter requests by me
            const myReqs = requestsRes.data.data.filter(r => r.studentId?._id === user?.id);
            setMyRequests(myReqs);
        } catch (err) {
            console.error("Failed to load catalog data:", err);
            setError("Failed to fetch available courses.");
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData();
        }, 0);
        return () => clearTimeout(timer);
    }, [fetchData]);

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

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "500px", height: "1.2rem", marginBottom: "2rem" }}></div>
                <div className="skeleton" style={{ height: "42px", borderRadius: "10px", marginBottom: "2rem" }}></div>
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
            <h1 className="page-title">University Course Catalogue</h1>
            <p className="page-subtitle">Browse all available courses, review descriptors, and request enrollment access.</p>

            {error && <div className="alert alert-danger animate-fade-in">{error}</div>}
            {successMsg && <div className="alert alert-success animate-fade-in">{successMsg}</div>}

            <div style={{ marginBottom: "2rem" }}>
                <div className="input-with-icon">
                    <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"/>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by course name, code, or description..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {filteredCourses.length === 0 ? (
                <div className="empty-state animate-slide-up" style={{ padding: "4rem 2rem" }}>
                    <div className="empty-state-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"/>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                    </div>
                    <div className="empty-state-title">No courses found</div>
                    <div className="empty-state-text">No courses match your search criteria. Try a different keyword.</div>
                </div>
            ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
                    {filteredCourses.map((course, index) => {
                        const status = getEnrollmentStatus(course._id);
                        return (
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
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                                            <span className="course-card-code">{course.code}</span>
                                            <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: "600" }}>
                                                {course.credits} Credits
                                            </span>
                                        </div>
                                        <h3 className="course-card-title">{course.name}</h3>
                                        <p className="course-card-desc" style={{ marginTop: "0.5rem" }}>
                                            {course.description ? (course.description.substring(0, 120) + (course.description.length > 120 ? "..." : "")) : "No description provided."}
                                        </p>
                                    </div>
                                    <div style={{ fontSize: "0.82rem", color: "var(--text-muted)", display: "flex", flexDirection: "column", gap: "0.4rem", marginTop: "1.5rem", flexGrow: 1 }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
                                                <line x1="9" y1="22" x2="9" y2="16"/>
                                                <line x1="15" y1="22" x2="15" y2="16"/>
                                            </svg>
                                            <span><strong>Dept:</strong> {course.departmentId?.name || "N/A"}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                                            </svg>
                                            <span><strong>Lecturer:</strong> {course.lecturerId?.name || "Not Assigned"}</span>
                                        </div>
                                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                                <line x1="16" y1="2" x2="16" y2="6"/>
                                                <line x1="8" y1="2" x2="8" y2="6"/>
                                                <line x1="3" y1="10" x2="21" y2="10"/>
                                            </svg>
                                            <span><strong>Semester:</strong> {course.semester}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="course-card-footer" style={{ padding: "0 1.5rem 1.5rem 1.5rem" }}>
                                    {status === "approved" ? (
                                        <div className="badge badge-success" style={{ width: "100%", padding: "0.6rem", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", fontWeight: "700" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "14px", height: "14px" }}>
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                            <span>Enrolled</span>
                                        </div>
                                    ) : status === "pending" ? (
                                        <div className="badge badge-warning" style={{ width: "100%", padding: "0.6rem", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", fontWeight: "700" }}>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <circle cx="12" cy="12" r="10"/>
                                                <polyline points="12 6 12 12 16 14"/>
                                            </svg>
                                            <span>Pending Approval</span>
                                        </div>
                                    ) : status === "rejected" ? (
                                        <div style={{ display: "flex", gap: "0.5rem", width: "100%" }}>
                                            <span className="badge badge-danger" style={{ flex: 1, padding: "0.6rem", justifyContent: "center", display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.85rem", fontWeight: "700" }}>
                                                <span>Rejected</span>
                                            </span>
                                            <button onClick={() => handleRequestEnrollment(course._id)} className="btn btn-primary btn-sm" style={{ padding: "0.6rem 1rem" }}>
                                                Re-apply
                                            </button>
                                        </div>
                                    ) : (
                                        <button onClick={() => handleRequestEnrollment(course._id)} className="btn btn-primary btn-sm" style={{ width: "100%", justifyContent: "center" }}>
                                            <span>Request Enrollment</span>
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                                                <path d="M12 5v14M5 12h14"/>
                                            </svg>
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

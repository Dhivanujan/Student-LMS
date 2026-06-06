// ============================================
// COURSE CARD COMPONENT - Displays Course Info
// ============================================

import React from "react";

const CourseCard = ({ course, user, onEnroll, onDelete, onUnenroll, isEnrolled }) => {
    const enrollCount = course.enrolledStudents?.length || 0;
    const isFull = enrollCount >= course.capacity;
    const fillPercentage = Math.min((enrollCount / course.capacity) * 100, 100);

    // Dynamic progress bar color based on course filling
    const getProgressBarColor = () => {
        if (fillPercentage >= 100) return "var(--error)";
        if (fillPercentage >= 80) return "var(--warning)";
        return "var(--success)";
    };

    return (
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
            <h3 style={{ marginBottom: "0.5rem", fontSize: "1.3rem" }}>{course.title}</h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", flexGrow: 1, marginBottom: "1.5rem" }}>
                {course.description}
            </p>

            <div style={{ fontSize: "0.85rem", marginBottom: "1.2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Instructor:</span>
                    <strong style={{ color: "var(--text-main)" }}>{course.instructor}</strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.8rem" }}>
                    <span style={{ color: "var(--text-muted)" }}>Duration:</span>
                    <strong style={{ color: "var(--text-main)" }}>{course.duration}</strong>
                </div>

                {/* Capacity Progress Bar */}
                <div style={{ marginBottom: "0.4rem", display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "var(--text-muted)" }}>Enrolled:</span>
                    <strong>{enrollCount} / {course.capacity} Students</strong>
                </div>
                
                <div style={{ width: "100%", height: "6px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "4px", overflow: "hidden" }}>
                    <div 
                        style={{ 
                            width: `${fillPercentage}%`, 
                            height: "100%", 
                            background: getProgressBarColor(),
                            transition: "width 0.4s ease"
                        }} 
                    />
                </div>
            </div>

            {/* Render action button based on role */}
            <div style={{ marginTop: "auto" }}>
                {user?.role === "admin" && onDelete && (
                    <button 
                        onClick={() => onDelete(course._id)} 
                        className="btn btn-danger" 
                        style={{ width: "100%" }}
                    >
                        Delete Course
                    </button>
                )}

                {user?.role === "student" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {isEnrolled ? (
                            <>
                                <button 
                                    disabled 
                                    className="btn btn-outline"
                                    style={{ 
                                        width: "100%", 
                                        color: "var(--success)", 
                                        borderColor: "var(--success)", 
                                        background: "rgba(16, 185, 129, 0.05)",
                                        cursor: "default"
                                    }}
                                >
                                    ✓ Enrolled
                                </button>
                                {onUnenroll && (
                                    <button 
                                        onClick={() => onUnenroll(course._id)}
                                        className="btn btn-danger"
                                        style={{ width: "100%", padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                                    >
                                        Cancel Enrollment
                                    </button>
                                )}
                            </>
                        ) : (
                            <button 
                                onClick={() => onEnroll && onEnroll(course._id)}
                                disabled={isFull}
                                className="btn btn-primary"
                                style={{ width: "100%" }}
                            >
                                {isFull ? "✕ Class Full" : "Enroll in Course"}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseCard;

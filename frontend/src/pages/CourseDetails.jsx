import React, { useState, useEffect, useContext } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [activeTab, setActiveTab] = useState("materials");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState(null);

    // Tab specific states
    const [materials, setMaterials] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [quizzes, setQuizzes] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState([]);
    const [studentAttendance, setStudentAttendance] = useState({ percentage: 100, data: [] });
    const [forumThreads, setForumThreads] = useState([]);
    const [announcements, setAnnouncements] = useState([]);

    const fetchCourseDetails = async () => {
        try {
            const res = await api.get(`/courses/${id}`);
            setCourse(res.data.data.course);
            setEnrolledStudents(res.data.data.enrolledStudents);
            setMaterials(res.data.data.course.materials || []);
        } catch (err) {
            console.error(err);
            setError("Failed to load course details.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTabData = async () => {
        if (!course) return;
        try {
            if (activeTab === "assignments") {
                const res = await api.get(`/assignments/course/${id}`);
                setAssignments(res.data.data);
            } else if (activeTab === "quizzes") {
                const res = await api.get(`/quizzes/course/${id}`);
                setQuizzes(res.data.data);
            } else if (activeTab === "attendance") {
                if (user.role === "student") {
                    const res = await api.get(`/attendance/course/${id}`);
                    setStudentAttendance(res.data);
                } else {
                    const res = await api.get(`/attendance/course/${id}/stats`);
                    setAttendanceStats(res.data.data);
                }
            } else if (activeTab === "forum") {
                const res = await api.get(`/forums/course/${id}`);
                setForumThreads(res.data.data);
            } else if (activeTab === "announcements") {
                const res = await api.get(`/announcements/course/${id}`);
                setAnnouncements(res.data.data);
            }
        } catch (err) {
            console.error("Failed to load tab data:", err);
        }
    };

    useEffect(() => {
        fetchCourseDetails();
    }, [id]);

    useEffect(() => {
        fetchTabData();
    }, [course, activeTab]);

    if (loading) return <div className="text-center">Loading course workspace...</div>;
    if (error) return <div className="alert alert-danger">{error}</div>;
    if (!course) return <div className="alert alert-danger">Course not found.</div>;

    return (
        <div>
            {/* Header Banner */}
            <div className="glass-card" style={{ marginBottom: "2rem" }}>
                <span className="badge badge-student" style={{ marginBottom: "0.5rem" }}>{course.code}</span>
                <h1 className="page-title">{course.name}</h1>
                <p style={{ color: "var(--text-muted)", marginBottom: "1rem" }}>{course.description}</p>
                <div style={{ display: "flex", gap: "2rem", fontSize: "0.9rem", color: "var(--text-muted)", flexWrap: "wrap" }}>
                    <span>🏫 <strong>Department:</strong> {course.departmentId?.name}</span>
                    <span>👨‍🏫 <strong>Lecturer:</strong> {course.lecturerId?.name || "Not Assigned"}</span>
                    <span>🌟 <strong>Credits:</strong> {course.credits} Credits</span>
                    <span>📅 <strong>Semester:</strong> {course.semester}</span>
                </div>
            </div>

            {successMsg && <div className="alert alert-success">{successMsg}</div>}

            {/* Navigation Tabs */}
            <div className="tabs-header">
                <button className={`tab-btn ${activeTab === "materials" ? "active" : ""}`} onClick={() => setActiveTab("materials")}>📚 Materials</button>
                <button className={`tab-btn ${activeTab === "assignments" ? "active" : ""}`} onClick={() => setActiveTab("assignments")}>📝 Assignments</button>
                <button className={`tab-btn ${activeTab === "quizzes" ? "active" : ""}`} onClick={() => setActiveTab("quizzes")}>⏳ Quizzes</button>
                <button className={`tab-btn ${activeTab === "attendance" ? "active" : ""}`} onClick={() => setActiveTab("attendance")}>📅 Attendance</button>
                <button className={`tab-btn ${activeTab === "forum" ? "active" : ""}`} onClick={() => setActiveTab("forum")}>💬 Forum</button>
                <button className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`} onClick={() => setActiveTab("announcements")}>📢 Announcements</button>
            </div>

            {/* Tab contents */}
            <div className="tab-pane">
                {activeTab === "materials" && (
                    <MaterialsTab 
                        materials={materials} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchCourseDetails} 
                    />
                )}
                {activeTab === "assignments" && (
                    <AssignmentsTab 
                        assignments={assignments} 
                        courseId={id} 
                        user={user} 
                        enrolledStudents={enrolledStudents}
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "quizzes" && (
                    <QuizzesTab 
                        quizzes={quizzes} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "attendance" && (
                    <AttendanceTab 
                        attendanceStats={attendanceStats} 
                        studentAttendance={studentAttendance}
                        courseId={id} 
                        user={user} 
                        enrolledStudents={enrolledStudents}
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "forum" && (
                    <ForumTab 
                        threads={forumThreads} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
                {activeTab === "announcements" && (
                    <AnnouncementsTab 
                        announcements={announcements} 
                        courseId={id} 
                        user={user} 
                        onUpdate={fetchTabData} 
                    />
                )}
            </div>
        </div>
    );
};

// ==========================================================================
// 1. MATERIALS TAB COMPONENT
// ==========================================================================
const MaterialsTab = ({ materials, courseId, user, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [fileType, setFileType] = useState("pdf");
    const [file, setFile] = useState(null);
    const [externalUrl, setExternalUrl] = useState("");
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title) return setError("Please add a title");

        const formData = new FormData();
        formData.append("title", title);
        formData.append("fileType", fileType);

        if (fileType === "link") {
            if (!externalUrl) return setError("Please add an external url");
            formData.append("externalUrl", externalUrl);
        } else {
            if (!file) return setError("Please select a file to upload");
            formData.append("materialFile", file);
        }

        setUploading(true);
        try {
            await api.post(`/courses/${courseId}/materials`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setFile(null);
            setExternalUrl("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (matId) => {
        if (!window.confirm("Delete this material?")) return;
        try {
            await api.delete(`/courses/${courseId}/materials/${matId}`);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.2fr 1fr" : "1fr", gap: "2rem" }}>
            <div className="glass-card">
                <h3>Learning Materials</h3>
                <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
                    Access learning guides, lecture PPTs, PDF manuals, links, and syllabus files.
                </p>

                {materials.length === 0 ? (
                    <p style={{ color: "var(--text-muted)" }}>No study materials uploaded yet.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {materials.map(mat => (
                            <div key={mat._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                    <span style={{ fontSize: "1.5rem" }}>
                                        {mat.fileType === "pdf" ? "📕" : mat.fileType === "word" ? "📘" : mat.fileType === "powerpoint" ? "📙" : mat.fileType === "video" ? "🎥" : "🔗"}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: "600" }}>{mat.title}</div>
                                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                            Type: {mat.fileType.toUpperCase()} • Uploaded: {new Date(mat.uploadedAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <a 
                                        href={mat.fileType === "link" ? mat.fileUrl : `http://localhost:5000${mat.fileUrl}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="btn btn-outline" 
                                        style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                                    >
                                        View / Open
                                    </a>
                                    {user.role !== "student" && (
                                        <button onClick={() => handleDelete(mat._id)} className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user.role !== "student" && (
                <div className="glass-card">
                    <h3>Upload New Material</h3>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handleUpload}>
                        <div className="form-group">
                            <label>Title</label>
                            <input type="text" className="form-input" placeholder="e.g. Lecture 1 Notes" value={title} onChange={e => setTitle(e.target.value)} />
                        </div>
                        <div className="form-group">
                            <label>Material Type</label>
                            <select className="form-input" value={fileType} onChange={e => setFileType(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                                <option value="pdf">PDF Document</option>
                                <option value="word">Word Document</option>
                                <option value="powerpoint">PowerPoint Presentation</option>
                                <option value="video">MP4 Video Lecture</option>
                                <option value="link">External URL Link</option>
                            </select>
                        </div>

                        {fileType === "link" ? (
                            <div className="form-group">
                                <label>External URL</label>
                                <input type="url" className="form-input" placeholder="https://example.com" value={externalUrl} onChange={e => setExternalUrl(e.target.value)} />
                            </div>
                        ) : (
                            <div className="form-group">
                                <label>Select File</label>
                                <input type="file" onChange={e => setFile(e.target.files[0])} style={{ color: "var(--text-muted)" }} />
                            </div>
                        )}

                        <button type="submit" className="btn btn-primary" disabled={uploading} style={{ width: "100%", marginTop: "1rem" }}>
                            {uploading ? "Uploading..." : "Upload Material"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 2. ASSIGNMENTS TAB COMPONENT
// ==========================================================================
const AssignmentsTab = ({ assignments, courseId, user, enrolledStudents, onUpdate }) => {
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [mySubmission, setMySubmission] = useState(null);

    // Create Assignment States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [maxMarks, setMaxMarks] = useState(100);
    const [file, setFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Student Submit Work States
    const [submitFile, setSubmitFile] = useState(null);
    const [submitComments, setSubmitComments] = useState("");
    const [uploadingSubmit, setUploadingSubmit] = useState(false);

    // Lecturer Grading States
    const [gradingSubId, setGradingSubId] = useState(null);
    const [grade, setGrade] = useState("");
    const [feedback, setFeedback] = useState("");

    const loadAssignmentDetails = async (assId) => {
        try {
            const res = await api.get(`/assignments/${assId}`);
            setSelectedAssignment(res.data.data.assignment);
            if (user.role === "student") {
                setMySubmission(res.data.data.mySubmission);
            } else {
                setSubmissions(res.data.data.submissions);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateAssignment = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !description || !dueDate) return setError("Please fill in all required fields");

        setSubmitting(true);
        const formData = new FormData();
        formData.append("courseId", courseId);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("dueDate", dueDate);
        formData.append("maxMarks", maxMarks);
        if (file) formData.append("assignmentFile", file);

        try {
            await api.post("/assignments", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            setTitle("");
            setDescription("");
            setDueDate("");
            setFile(null);
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleStudentSubmit = async (e) => {
        e.preventDefault();
        if (!submitFile) return alert("Please select a file to submit");

        setUploadingSubmit(true);
        const formData = new FormData();
        formData.append("submissionFile", submitFile);
        formData.append("comments", submitComments);

        try {
            await api.post(`/assignments/${selectedAssignment._id}/submit`, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            alert("Assignment submitted successfully!");
            setSubmitFile(null);
            setSubmitComments("");
            loadAssignmentDetails(selectedAssignment._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to submit assignment");
        } finally {
            setUploadingSubmit(false);
        }
    };

    const handleGradeSubmission = async (e) => {
        e.preventDefault();
        if (grade === "") return alert("Please specify a grade");

        try {
            await api.put(`/assignments/submission/${gradingSubId}/grade`, { grade, feedback });
            alert("Submission graded successfully!");
            setGrade("");
            setFeedback("");
            setGradingSubId(null);
            loadAssignmentDetails(selectedAssignment._id);
        } catch (err) {
            alert(err.response?.data?.message || "Grading failed");
        }
    };

    return (
        <div>
            {selectedAssignment ? (
                // DETAIL WORKSPACE FOR SELECTED ASSIGNMENT
                <div className="glass-card">
                    <button onClick={() => setSelectedAssignment(null)} className="btn btn-outline" style={{ marginBottom: "1.5rem" }}>
                        ⬅ Back to Assignments List
                    </button>

                    <h2>{selectedAssignment.title}</h2>
                    <p style={{ margin: "1rem 0" }}>{selectedAssignment.description}</p>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
                        <span>📅 Due Date: {new Date(selectedAssignment.dueDate).toLocaleString()}</span>
                        <span>⭐ Max Marks: {selectedAssignment.maxMarks}</span>
                        {selectedAssignment.fileUrl && (
                            <a href={`http://localhost:5000${selectedAssignment.fileUrl}`} target="_blank" rel="noopener noreferrer" className="link-alt">
                                Download Guidelines File
                            </a>
                        )}
                    </div>

                    {user.role === "student" ? (
                        // STUDENT VIEW: SHOW MY SUBMISSION STATUS & FORM
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>My Submission State</h3>
                            {mySubmission ? (
                                <div style={{ background: "rgba(255,255,255,0.02)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)", marginTop: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                                        <span>Status: <strong style={{ color: mySubmission.status === "graded" ? "var(--success)" : "var(--primary)" }}>{mySubmission.status.toUpperCase()}</strong></span>
                                        <span>Submitted on: {new Date(mySubmission.submittedAt).toLocaleString()}</span>
                                    </div>
                                    <div style={{ marginBottom: "1rem" }}>
                                        <strong>Submission File:</strong>{" "}
                                        <a href={`http://localhost:5000${mySubmission.fileUrl}`} target="_blank" rel="noopener noreferrer" className="link-alt">
                                            View Submitted Work
                                        </a>
                                    </div>
                                    {mySubmission.comments && <p><strong>My Comments:</strong> {mySubmission.comments}</p>}

                                    {mySubmission.status === "graded" && (
                                        <div style={{ marginTop: "1.5rem", borderTop: "1px dashed var(--border-color)", paddingTop: "1rem", background: "rgba(16, 185, 129, 0.05)", padding: "1rem", borderRadius: "8px" }}>
                                            <h4 style={{ color: "var(--success)", marginBottom: "0.5rem" }}>Lecturer Evaluation Result</h4>
                                            <div><strong>Score:</strong> {mySubmission.grade} / {selectedAssignment.maxMarks}</div>
                                            {mySubmission.feedback && <div><strong>Feedback:</strong> {mySubmission.feedback}</div>}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleStudentSubmit} style={{ maxWidth: "500px", marginTop: "1rem" }}>
                                    <div className="form-group">
                                        <label>Select Submission File (PDF, DOCX, etc.)</label>
                                        <input type="file" onChange={e => setSubmitFile(e.target.files[0])} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Comments / Text Answer (Optional)</label>
                                        <textarea className="form-input" rows="3" placeholder="Write any notes to your lecturer..." value={submitComments} onChange={e => setSubmitComments(e.target.value)}></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={uploadingSubmit}>
                                        {uploadingSubmit ? "Uploading..." : "Submit Assignment"}
                                    </button>
                                </form>
                            )}
                        </div>
                    ) : (
                        // LECTURER VIEW: SHOW ALL SUBMISSIONS AND GRADING PORTAL
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>Student Submissions List</h3>
                            
                            {submissions.length === 0 ? (
                                <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No student has submitted this assignment yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Student Name</th>
                                                <th>Submitted At</th>
                                                <th>Status</th>
                                                <th>Grade</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {submissions.map(sub => (
                                                <tr key={sub._id}>
                                                    <td>{sub.studentId?.studentId}</td>
                                                    <td>{sub.studentId?.name}</td>
                                                    <td>{new Date(sub.submittedAt).toLocaleString()}</td>
                                                    <td>
                                                        <span className={`badge ${sub.status === "graded" ? "badge-lecturer" : sub.status === "late" ? "badge-admin" : "badge-student"}`}>
                                                            {sub.status}
                                                        </span>
                                                    </td>
                                                    <td>{sub.grade !== null ? `${sub.grade}/${selectedAssignment.maxMarks}` : "Not Graded"}</td>
                                                    <td>
                                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                                            <a href={`http://localhost:5000${sub.fileUrl}`} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                                                                Download file
                                                            </a>
                                                            <button onClick={() => { setGradingSubId(sub._id); setGrade(sub.grade || ""); setFeedback(sub.feedback || ""); }} className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>
                                                                Grade
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Grading Modal mockup */}
                            {gradingSubId && (
                                <div className="glass-card" style={{ marginTop: "2rem", maxWidth: "500px" }}>
                                    <h4>Grade Student Work</h4>
                                    <form onSubmit={handleGradeSubmission} style={{ marginTop: "1rem" }}>
                                        <div className="form-group">
                                            <label>Marks (out of {selectedAssignment.maxMarks})</label>
                                            <input type="number" className="form-input" max={selectedAssignment.maxMarks} min={0} value={grade} onChange={e => setGrade(e.target.value)} required />
                                        </div>
                                        <div className="form-group">
                                            <label>Written Feedback</label>
                                            <textarea className="form-input" rows="3" placeholder="Provide constructive criticism..." value={feedback} onChange={e => setFeedback(e.target.value)}></textarea>
                                        </div>
                                        <div style={{ display: "flex", gap: "0.5rem" }}>
                                            <button type="submit" className="btn btn-primary">Save Grade</button>
                                            <button type="button" onClick={() => setGradingSubId(null)} className="btn btn-outline">Cancel</button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // ASSIGNMENTS LIST VIEW
                <div style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.2fr 1fr" : "1fr", gap: "2rem" }}>
                    <div className="glass-card">
                        <h3>Assignments List</h3>
                        {assignments.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No assignments posted yet.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                                {assignments.map(ass => (
                                    <div key={ass._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                                        <div>
                                            <div style={{ fontWeight: "600" }}>{ass.title}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                                Due Date: {new Date(ass.dueDate).toLocaleString()} • Marks: {ass.maxMarks}
                                            </div>
                                        </div>
                                        <button onClick={() => loadAssignmentDetails(ass._id)} className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                                            Open Assignment Workspace
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user.role !== "student" && (
                        <div className="glass-card">
                            <h3>Create New Assignment</h3>
                            {error && <div className="alert alert-danger">{error}</div>}

                            <form onSubmit={handleCreateAssignment}>
                                <div className="form-group">
                                    <label>Assignment Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Midterm Essay" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Detailed Description</label>
                                    <textarea className="form-input" rows="4" placeholder="Specify instructions..." value={description} onChange={e => setDescription(e.target.value)} required></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Due Date & Time</label>
                                    <input type="datetime-local" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Maximum Marks Available</label>
                                    <input type="number" className="form-input" value={maxMarks} onChange={e => setMaxMarks(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Guideline File Attachment (Optional)</label>
                                    <input type="file" onChange={e => setFile(e.target.files[0])} />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", marginTop: "1rem" }}>
                                    {submitting ? "Posting..." : "Post Assignment"}
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 3. QUIZZES TAB COMPONENT
// ==========================================================================
const QuizzesTab = ({ quizzes, courseId, user, onUpdate }) => {
    const navigate = useNavigate();

    // Create Quiz States
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [duration, setDuration] = useState(30);
    const [dueDate, setDueDate] = useState("");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Selected Quiz Configuration States
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);

    // Question form builder states
    const [qText, setQText] = useState("");
    const [qType, setQType] = useState("mcq");
    const [qOptions, setQOptions] = useState(["", "", "", ""]);
    const [qAnswer, setQAnswer] = useState("0");
    const [qPoints, setQPoints] = useState(5);

    const loadQuizDetails = async (quizId) => {
        try {
            const [questionsRes, resultsRes] = await Promise.all([
                api.post(`/quizzes/${quizId}/attempt`), // Fetch questions safely
                api.get(`/quizzes/${quizId}/results`) // Fetch results list
            ]);
            setSelectedQuiz(quizzes.find(q => q._id === quizId));
            setQuestions(questionsRes.data.data.questions);
            setResults(resultsRes.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!title || !dueDate) return setError("Please fill in required fields");

        try {
            await api.post("/quizzes", {
                courseId,
                title,
                description,
                durationMinutes: duration,
                dueDate
            });
            setSuccess("Quiz shell created successfully!");
            setTitle("");
            setDescription("");
            setDueDate("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to create quiz");
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        if (!qText) return alert("Question text required");

        let payload = {
            text: qText,
            type: qType,
            points: qPoints,
            correctAnswer: qAnswer
        };

        if (qType === "mcq") {
            payload.options = qOptions;
        } else if (qType === "true_false") {
            payload.correctAnswer = qAnswer; // "true" or "false"
        }

        try {
            await api.post(`/quizzes/${selectedQuiz._id}/questions`, {
                questions: [payload]
            });
            alert("Question added!");
            setQText("");
            setQOptions(["", "", "", ""]);
            loadQuizDetails(selectedQuiz._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add question");
        }
    };

    return (
        <div>
            {selectedQuiz ? (
                // SELECTED QUIZ SETUP/RESULTS PORTAL
                <div className="glass-card">
                    <button onClick={() => setSelectedQuiz(null)} className="btn btn-outline" style={{ marginBottom: "1.5rem" }}>
                        ⬅ Back to Quizzes List
                    </button>
                    <h2>{selectedQuiz.title}</h2>
                    <p style={{ margin: "1rem 0" }}>{selectedQuiz.description}</p>
                    <div style={{ display: "flex", gap: "1.5rem", fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "2rem" }}>
                        <span>⏱ Duration: {selectedQuiz.durationMinutes} minutes</span>
                        <span>📅 Due Date: {new Date(selectedQuiz.dueDate).toLocaleString()}</span>
                    </div>

                    {user.role !== "student" ? (
                        // LECTURER VIEW: EDIT QUESTIONS & ROSTER RESULTS
                        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            
                            <div>
                                <h3>Quiz Questions ({questions.length})</h3>
                                {questions.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No questions added to this quiz yet.</p>
                                ) : (
                                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                                        {questions.map((q, idx) => (
                                            <div key={q._id} style={{ background: "rgba(0,0,0,0.15)", padding: "1rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                                <strong>{idx + 1}. {q.text}</strong>{" "}
                                                <span style={{ float: "right", fontSize: "0.8rem", color: "var(--text-muted)" }}>({q.points} pts)</span>
                                                <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>Type: {q.type.toUpperCase()}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <h3 style={{ marginTop: "2rem", marginBottom: "1rem" }}>Student Submissions Results</h3>
                                {results.length === 0 ? (
                                    <p style={{ color: "var(--text-muted)" }}>No attempts submitted yet.</p>
                                ) : (
                                    <div className="table-responsive">
                                        <table className="premium-table">
                                            <thead>
                                                <tr>
                                                    <th>Student ID</th>
                                                    <th>Name</th>
                                                    <th>Score Obtained</th>
                                                    <th>Evaluation Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {results.map(res => (
                                                    <tr key={res._id}>
                                                        <td>{res.studentId?.studentId}</td>
                                                        <td>{res.studentId?.name}</td>
                                                        <td><strong>{res.score}</strong> / {res.totalMarks}</td>
                                                        <td>
                                                            <span className={`badge ${res.graded ? "badge-lecturer" : "badge-admin"}`}>
                                                                {res.graded ? "Graded" : "Needs Grading (Short Answer)"}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* ADD QUESTION FORM BUILDER */}
                            <div className="glass-card" style={{ background: "rgba(0,0,0,0.2)" }}>
                                <h3>Add Question</h3>
                                <form onSubmit={handleAddQuestion} style={{ marginTop: "1rem" }}>
                                    <div className="form-group">
                                        <label>Question Type</label>
                                        <select className="form-input" value={qType} onChange={e => { setQType(e.target.value); setQAnswer(e.target.value === "true_false" ? "true" : "0"); }} style={{ background: "var(--bg-dark)" }}>
                                            <option value="mcq">Multiple Choice Question (MCQ)</option>
                                            <option value="true_false">True / False</option>
                                            <option value="short_answer">Short / Written Answer</option>
                                        </select>
                                    </div>

                                    <div className="form-group">
                                        <label>Question Content</label>
                                        <textarea className="form-input" rows="3" placeholder="Enter question description..." value={qText} onChange={e => setQText(e.target.value)} required></textarea>
                                    </div>

                                    {qType === "mcq" && (
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1rem" }}>
                                            <label style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>MCQ Choices</label>
                                            {qOptions.map((opt, i) => (
                                                <input key={i} type="text" className="form-input" placeholder={`Option ${i+1}`} value={opt} onChange={e => {
                                                    const copy = [...qOptions];
                                                    copy[i] = e.target.value;
                                                    setQOptions(copy);
                                                }} required />
                                            ))}
                                            <div className="form-group" style={{ marginTop: "0.5rem" }}>
                                                <label>Correct Choice index</label>
                                                <select className="form-input" value={qAnswer} onChange={e => setQAnswer(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                                                    <option value="0">Choice 1</option>
                                                    <option value="1">Choice 2</option>
                                                    <option value="2">Choice 3</option>
                                                    <option value="3">Choice 4</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}

                                    {qType === "true_false" && (
                                        <div className="form-group">
                                            <label>Correct Answer Key</label>
                                            <select className="form-input" value={qAnswer} onChange={e => setQAnswer(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                                                <option value="true">True</option>
                                                <option value="false">False</option>
                                            </select>
                                        </div>
                                    )}

                                    {qType === "short_answer" && (
                                        <div className="form-group">
                                            <label>Grading Rubric Key / Expected Keywords</label>
                                            <input type="text" className="form-input" placeholder="e.g. key terms to look for..." value={qAnswer} onChange={e => setQAnswer(e.target.value)} required />
                                        </div>
                                    )}

                                    <div className="form-group">
                                        <label>Weight Points</label>
                                        <input type="number" className="form-input" value={qPoints} onChange={e => setQPoints(parseInt(e.target.value))} required />
                                    </div>

                                    <button type="submit" className="btn btn-primary" style={{ width: "100%" }}>
                                        Add to Quiz
                                    </button>
                                </form>
                            </div>
                        </div>
                    ) : (
                        // STUDENT VIEW: CHECK FOR ATTEMPT LOGS OR OPEN TIMED INTERFACE
                        <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                            <h3>My Attempt Roster</h3>
                            {results.length > 0 ? (
                                <div style={{ background: "rgba(16, 185, 129, 0.05)", border: "1px solid var(--success)", padding: "1.5rem", borderRadius: "8px", marginTop: "1rem", maxWidth: "500px" }}>
                                    <h4 style={{ color: "var(--success)" }}>Quiz Attempted successfully!</h4>
                                    <div style={{ margin: "1rem 0" }}>
                                        <strong>Grading:</strong> {results[0].graded ? "Evaluated" : "Pending written grading"} <br />
                                        <strong>Final Score:</strong> {results[0].score} / {results[0].totalMarks}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                                        Submitted on: {new Date(results[0].createdAt).toLocaleString()}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center" style={{ padding: "2rem" }}>
                                    <p style={{ marginBottom: "1.5rem" }}>You have not attempted this timed quiz yet. The timer will start immediately upon load.</p>
                                    <button onClick={() => navigate(`/courses/${courseId}/quizzes/${selectedQuiz._id}`)} className="btn btn-primary" style={{ padding: "0.8rem 2rem" }}>
                                        🚀 Start Timed Quiz
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                // QUIZZES LIST VIEW
                <div style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.2fr 1fr" : "1fr", gap: "2rem" }}>
                    <div className="glass-card">
                        <h3>Quizzes & Midterms</h3>
                        {quizzes.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No quizzes created yet.</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                                {quizzes.map(q => (
                                    <div key={q._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1rem", background: "rgba(255,255,255,0.02)", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                                        <div>
                                            <div style={{ fontWeight: "600" }}>{q.title}</div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                                                Time limit: {q.durationMinutes} mins • Due: {new Date(q.dueDate).toLocaleString()}
                                            </div>
                                        </div>
                                        <button onClick={() => loadQuizDetails(q._id)} className="btn btn-primary" style={{ padding: "0.45rem 1rem", fontSize: "0.85rem" }}>
                                            Open Quiz Portal
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {user.role !== "student" && (
                        <div className="glass-card">
                            <h3>Create New Quiz Shell</h3>
                            {error && <div className="alert alert-danger">{error}</div>}
                            {success && <div className="alert alert-success">{success}</div>}

                            <form onSubmit={handleCreateQuiz}>
                                <div className="form-group">
                                    <label>Quiz Title</label>
                                    <input type="text" className="form-input" placeholder="e.g. Chapter 1 Quiz" value={title} onChange={e => setTitle(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>Instructions</label>
                                    <textarea className="form-input" rows="3" placeholder="Specify instructions..." value={description} onChange={e => setDescription(e.target.value)}></textarea>
                                </div>
                                <div className="form-group">
                                    <label>Time Limit (Minutes)</label>
                                    <input type="number" className="form-input" value={duration} onChange={e => setDuration(parseInt(e.target.value))} required />
                                </div>
                                <div className="form-group">
                                    <label>Due Date & Time</label>
                                    <input type="datetime-local" className="form-input" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
                                </div>
                                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem" }}>
                                    Create Quiz Shell
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 4. ATTENDANCE TAB COMPONENT
// ==========================================================================
const AttendanceTab = ({ attendanceStats, studentAttendance, courseId, user, enrolledStudents, onUpdate }) => {
    const [markingDate, setMarkingDate] = useState(new Date().toISOString().substring(0, 10));
    const [marks, setMarks] = useState({}); // { studentId: 'present'/'absent'/'late' }
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        // Initialize all student marks as present
        if (enrolledStudents) {
            const initial = {};
            enrolledStudents.forEach(stu => {
                initial[stu._id] = "present";
            });
            setMarks(initial);
        }
    }, [enrolledStudents]);

    const handleStatusChange = (stuId, status) => {
        setMarks(prev => ({
            ...prev,
            [stuId]: status
        }));
    };

    const handleMarkAttendance = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        const records = Object.keys(marks).map(stuId => ({
            studentId: stuId,
            status: marks[stuId]
        }));

        try {
            await api.post("/attendance", {
                courseId,
                date: markingDate,
                records
            });
            alert("Attendance register saved!");
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to mark attendance");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div>
            {user.role === "student" ? (
                // STUDENT VIEW
                <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
                    <div className="glass-card text-center" style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
                        <h3>Overall Attendance</h3>
                        <div className="value" style={{ fontSize: "3rem", margin: "1.5rem 0", color: studentAttendance.percentage >= 75 ? "var(--success)" : "var(--error)" }}>
                            {studentAttendance.percentage}%
                        </div>
                        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                            {studentAttendance.percentage >= 75 ? "You meet the minimum 75% attendance criteria! 👍" : "Warning: Attendance falls below 75% required minimum! 🚨"}
                        </p>
                    </div>

                    <div className="glass-card">
                        <h3>Attendance Log history</h3>
                        {(!studentAttendance.data || studentAttendance.data.length === 0) ? (
                            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No attendance marked yet.</p>
                        ) : (
                            <div className="table-responsive" style={{ marginTop: "1rem" }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Class Session Date</th>
                                            <th>Check-In Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentAttendance.data.map((log, idx) => (
                                            <tr key={idx}>
                                                <td>{new Date(log.date).toLocaleDateString()}</td>
                                                <td>
                                                    <span className={`badge ${log.status === "present" ? "badge-lecturer" : log.status === "absent" ? "badge-admin" : "badge-student"}`}>
                                                        {log.status.toUpperCase()}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                // LECTURER VIEW: ROSTER AND MARKING GRID
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
                    
                    {/* Mark Daily Attendance */}
                    <div className="glass-card">
                        <h3>Mark Daily Attendance</h3>
                        <form onSubmit={handleMarkAttendance} style={{ marginTop: "1rem" }}>
                            <div className="form-group" style={{ maxWidth: "250px" }}>
                                <label>Lecture Date</label>
                                <input type="date" className="form-input" value={markingDate} onChange={e => setMarkingDate(e.target.value)} required />
                            </div>

                            {enrolledStudents.length === 0 ? (
                                <p style={{ color: "var(--text-muted)" }}>No students enrolled in this course.</p>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem", margin: "1.5rem 0" }}>
                                    {enrolledStudents.map(student => (
                                        <div key={student._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.8rem 1rem", background: "rgba(0,0,0,0.15)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                                            <div>
                                                <span style={{ fontWeight: "600" }}>{student.name}</span>
                                                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({student.studentId})</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button type="button" onClick={() => handleStatusChange(student._id, "present")} className={`btn ${marks[student._id] === "present" ? "btn-primary" : "btn-outline"}`} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Present</button>
                                                <button type="button" onClick={() => handleStatusChange(student._id, "absent")} className={`btn ${marks[student._id] === "absent" ? "btn-danger" : "btn-outline"}`} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem" }}>Absent</button>
                                                <button type="button" onClick={() => handleStatusChange(student._id, "late")} className={`btn ${marks[student._id] === "late" ? "btn-outline" : "btn-outline"}`} style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", background: marks[student._id] === "late" ? "rgba(245, 158, 11, 0.2)" : "", color: marks[student._id] === "late" ? "#fbbf24" : "" }}>Late</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="btn btn-primary" disabled={submitting || enrolledStudents.length === 0}>
                                {submitting ? "Saving Register..." : "Submit Attendance Register"}
                            </button>
                        </form>
                    </div>

                    {/* Attendance stats summary */}
                    <div className="glass-card">
                        <h3>Attendance Stats Roster</h3>
                        {attendanceStats.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No registers submitted yet.</p>
                        ) : (
                            <div className="table-responsive" style={{ marginTop: "1rem" }}>
                                <table className="premium-table">
                                    <thead>
                                        <tr>
                                            <th>Student Name</th>
                                            <th>Present</th>
                                            <th>Late</th>
                                            <th>Absent</th>
                                            <th>Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendanceStats.map(stat => (
                                            <tr key={stat.id}>
                                                <td>{stat.name}</td>
                                                <td>{stat.present}</td>
                                                <td>{stat.late}</td>
                                                <td>{stat.absent}</td>
                                                <td>
                                                    <strong style={{ color: stat.percentage >= 75 ? "var(--success)" : "var(--error)" }}>
                                                        {stat.percentage}%
                                                    </strong>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 5. DISCUSSION FORUM TAB COMPONENT
// ==========================================================================
const ForumTab = ({ threads, courseId, user, onUpdate }) => {
    const [selectedThread, setSelectedThread] = useState(null);
    const [comments, setComments] = useState([]);

    // Thread Builder states
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [posting, setPosting] = useState(false);

    // Comment Builder States
    const [commentText, setCommentText] = useState("");
    const [replyingToCommentId, setReplyingToCommentId] = useState(null);
    const [replyText, setReplyText] = useState("");

    const loadThreadDetails = async (threadId) => {
        try {
            const res = await api.get(`/forums/threads/${threadId}`);
            setSelectedThread(res.data.data.thread);
            setComments(res.data.data.comments);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateThread = async (e) => {
        e.preventDefault();
        if (!title || !content) return;

        setPosting(true);
        try {
            await api.post("/forums/threads", { courseId, title, content });
            setTitle("");
            setContent("");
            onUpdate();
        } catch (err) {
            alert(err.response?.data?.message || "Failed to create thread");
        } finally {
            setPosting(false);
        }
    };

    const handlePostComment = async (e, parentId = null) => {
        e.preventDefault();
        const text = parentId ? replyText : commentText;
        if (!text) return;

        try {
            await api.post("/forums/comments", {
                threadId: selectedThread._id,
                content: text,
                parentId
            });
            if (parentId) {
                setReplyText("");
                setReplyingToCommentId(null);
            } else {
                setCommentText("");
            }
            loadThreadDetails(selectedThread._id);
        } catch (err) {
            alert(err.response?.data?.message || "Failed to post comment");
        }
    };

    const handleDeleteThread = async (threadId) => {
        if (!window.confirm("Delete thread?")) return;
        try {
            await api.delete(`/forums/threads/${threadId}`);
            setSelectedThread(null);
            onUpdate();
        } catch (err) {
            alert("Delete failed");
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete comment?")) return;
        try {
            await api.delete(`/forums/comments/${commentId}`);
            loadThreadDetails(selectedThread._id);
        } catch (err) {
            alert("Delete failed");
        }
    };

    return (
        <div>
            {selectedThread ? (
                // THREAD DETAILS AND DISCUSSIONS VIEW
                <div className="glass-card">
                    <button onClick={() => setSelectedThread(null)} className="btn btn-outline" style={{ marginBottom: "1.5rem" }}>
                        ⬅ Back to Discussions
                    </button>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                            <h2>{selectedThread.title}</h2>
                            <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.5rem 0" }}>
                                By <strong>{selectedThread.authorId?.name}</strong> ({selectedThread.authorId?.role}) • Posted: {new Date(selectedThread.createdAt).toLocaleString()}
                            </div>
                        </div>
                        {(user.role === "admin" || selectedThread.authorId?._id === user.id) && (
                            <button onClick={() => handleDeleteThread(selectedThread._id)} className="btn btn-danger" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                Delete Thread
                            </button>
                        )}
                    </div>
                    
                    <p style={{ marginTop: "1rem", whiteSpace: "pre-wrap", background: "rgba(0,0,0,0.15)", padding: "1.5rem", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                        {selectedThread.content}
                    </p>

                    {/* Comments Feed */}
                    <div style={{ marginTop: "2rem", borderTop: "1px solid var(--border-color)", paddingTop: "1.5rem" }}>
                        <h3>Discussion Replies ({comments.length})</h3>

                        <div style={{ marginTop: "1.5rem" }}>
                            {comments.map(comment => (
                                <div key={comment._id} className="forum-comment-card" style={{ padding: "0.8rem", background: "rgba(255,255,255,0.01)", borderRadius: "8px", marginBottom: "1rem" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        <span style={{ fontSize: "0.85rem" }}>
                                            <strong>{comment.authorId?.name}</strong>{" "}
                                            <span className={`badge badge-${comment.authorId?.role}`} style={{ fontSize: "0.65rem", padding: "0.2rem 0.4rem", marginLeft: "0.5rem" }}>
                                                {comment.authorId?.role}
                                            </span>
                                        </span>
                                        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                            {new Date(comment.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p style={{ margin: "0.5rem 0", fontSize: "0.95rem" }}>{comment.content}</p>
                                    
                                    <div style={{ display: "flex", gap: "1rem" }}>
                                        <button onClick={() => setReplyingToCommentId(comment._id)} className="link-alt" style={{ border: "none", background: "none", fontSize: "0.8rem", cursor: "pointer" }}>Reply</button>
                                        {(user.role === "admin" || comment.authorId?._id === user.id) && (
                                            <button onClick={() => handleDeleteComment(comment._id)} className="btn-danger" style={{ border: "none", background: "none", fontSize: "0.8rem", cursor: "pointer", color: "var(--error)" }}>Delete</button>
                                        )}
                                    </div>

                                    {replyingToCommentId === comment._id && (
                                        <form onSubmit={(e) => handlePostComment(e, comment._id)} style={{ marginTop: "1rem", maxWidth: "400px" }}>
                                            <input type="text" className="form-input" placeholder="Write a reply..." value={replyText} onChange={e => setReplyText(e.target.value)} required />
                                            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                                                <button type="submit" className="btn btn-primary" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Post Reply</button>
                                                <button type="button" onClick={() => setReplyingToCommentId(null)} className="btn btn-outline" style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}>Cancel</button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Top-level comment box */}
                        <form onSubmit={(e) => handlePostComment(e, null)} style={{ marginTop: "2rem", maxWidth: "600px" }}>
                            <h4>Join the Discussion</h4>
                            <div className="form-group" style={{ marginTop: "1rem" }}>
                                <textarea className="form-input" rows="3" placeholder="Post an answer or ask a question..." value={commentText} onChange={e => setCommentText(e.target.value)} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary">Submit Comment</button>
                        </form>
                    </div>
                </div>
            ) : (
                // THREADS LIST VIEW
                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "2rem" }}>
                    <div className="glass-card">
                        <h3>Discussions Forum</h3>
                        {threads.length === 0 ? (
                            <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No discussion topics started. Be the first to start a thread!</p>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
                                {threads.map(thread => (
                                    <div key={thread._id} className="forum-thread-card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <div>
                                            <div onClick={() => loadThreadDetails(thread._id)} style={{ fontWeight: "600", cursor: "pointer", fontSize: "1.1rem" }} className="link-alt">
                                                {thread.title}
                                            </div>
                                            <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.3rem" }}>
                                                By {thread.authorId?.name} ({thread.authorId?.role}) • {new Date(thread.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <button onClick={() => loadThreadDetails(thread._id)} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                                            Open Forum Thread
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="glass-card">
                        <h3>Post New Thread</h3>
                        <form onSubmit={handleCreateThread}>
                            <div className="form-group">
                                <label>Topic Title</label>
                                <input type="text" className="form-input" placeholder="e.g. Question regarding Assignment 1" value={title} onChange={e => setTitle(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label>Body / Description</label>
                                <textarea className="form-input" rows="5" placeholder="Elaborate your discussion prompt..." value={content} onChange={e => setContent(e.target.value)} required></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={posting} style={{ width: "100%", marginTop: "1rem" }}>
                                {posting ? "Posting..." : "Create Thread Topic"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

// ==========================================================================
// 6. ANNOUNCEMENTS TAB COMPONENT
// ==========================================================================
const AnnouncementsTab = ({ announcements, courseId, user, onUpdate }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [priority, setPriority] = useState("normal");
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState(null);

    const handlePost = async (e) => {
        e.preventDefault();
        setError(null);
        if (!title || !content) return setError("Please fill in all fields");

        setPosting(true);
        try {
            await api.post("/announcements", {
                title,
                content,
                scope: "course",
                targetId: courseId,
                priority
            });
            setTitle("");
            setContent("");
            onUpdate();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to post announcement");
        } finally {
            setPosting(false);
        }
    };

    const handleDelete = async (annId) => {
        if (!window.confirm("Delete this notice?")) return;
        try {
            await api.delete(`/announcements/${annId}`);
            onUpdate();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ display: "grid", gridTemplateColumns: user.role !== "student" ? "1.2fr 1fr" : "1fr", gap: "2rem" }}>
            <div className="glass-card">
                <h3>Course Announcements</h3>

                {announcements.length === 0 ? (
                    <p style={{ color: "var(--text-muted)", marginTop: "1rem" }}>No announcements posted for this course.</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem", marginTop: "1.2rem" }}>
                        {announcements.map(ann => (
                            <div key={ann._id} style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", position: "relative" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <span style={{ fontWeight: "600", fontSize: "1.1rem", color: ann.priority === "high" ? "var(--error)" : "var(--text-main)" }}>
                                        {ann.title} {ann.priority === "high" && "🚨"}
                                    </span>
                                    {user.role !== "student" && (
                                        <button onClick={() => handleDelete(ann._id)} className="btn btn-danger" style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem" }}>
                                            Remove Notice
                                        </button>
                                    )}
                                </div>
                                <p style={{ fontSize: "0.9rem", color: "var(--text-muted)", margin: "0.5rem 0", whiteSpace: "pre-wrap" }}>{ann.content}</p>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                    Posted: {new Date(ann.createdAt).toLocaleString()} By {ann.authorId?.name}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {user.role !== "student" && (
                <div className="glass-card">
                    <h3>Post Course Announcement</h3>
                    {error && <div className="alert alert-danger">{error}</div>}

                    <form onSubmit={handlePost}>
                        <div className="form-group">
                            <label>Notice Title</label>
                            <input type="text" className="form-input" placeholder="e.g. Lecture Postponed" value={title} onChange={e => setTitle(e.target.value)} required />
                        </div>
                        <div className="form-group">
                            <label>Announcement Body</label>
                            <textarea className="form-input" rows="4" placeholder="Type detail description..." value={content} onChange={e => setContent(e.target.value)} required></textarea>
                        </div>
                        <div className="form-group">
                            <label>Priority</label>
                            <select className="form-input" value={priority} onChange={e => setPriority(e.target.value)} style={{ background: "var(--bg-dark)" }}>
                                <option value="normal">Normal Notice</option>
                                <option value="high">Urgent/High Priority Notice 🚨</option>
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={posting} style={{ width: "100%", marginTop: "1rem" }}>
                            {posting ? "Posting..." : "Post Announcement"}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default CourseDetails;

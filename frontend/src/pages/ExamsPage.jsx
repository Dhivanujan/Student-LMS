import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const ExamsPage = () => {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // Student States
    const [reportCard, setReportCard] = useState(null);

    // Lecturer / Admin States
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [venues, setVenues] = useState([]);
    
    // Schedule Form States
    const [courseId, setCourseId] = useState("");
    const [venueId, setVenueId] = useState("");
    const [examName, setExamName] = useState("");
    const [examDate, setExamDate] = useState("");
    const [maxMarks, setMaxMarks] = useState(100);
    const [submittingExam, setSubmittingExam] = useState(false);

    // Grading Panel States
    const [gradingExam, setGradingExam] = useState(null);
    const [enrolledStudents, setEnrolledStudents] = useState([]);
    const [studentScores, setStudentScores] = useState({}); // studentUserId -> score
    const [savingGrades, setSavingGrades] = useState(false);

    const isStudent = user?.role === "student";

    const fetchStudentReport = async () => {
        try {
            const res = await api.get("/exams/report-card");
            setReportCard(res.data.data);
        } catch (err) {
            console.error("Failed to load student report card:", err);
            setError("Could not load student grades.");
        } finally {
            setLoading(false);
        }
    };

    const fetchLecturerAdminData = async () => {
        try {
            const [examsRes, coursesRes, venuesRes] = await Promise.all([
                api.get("/exams"),
                api.get(user.role === "lecturer" ? `/courses?lecturerId=${user.id}` : "/courses"),
                api.get("/events/venues")
            ]);
            setExams(examsRes.data.data);
            setCourses(coursesRes.data.data);
            setVenues(venuesRes.data.data);
        } catch (err) {
            console.error("Failed to load exam office data:", err);
            setError("Could not load exam records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user) return;
        if (isStudent) {
            fetchStudentReport();
        } else {
            fetchLecturerAdminData();
        }
    }, [user]);

    // Lecturer / Admin Handlers
    const handleScheduleExam = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        if (!courseId || !venueId || !examName || !examDate) {
            return setError("Please fill in all scheduling fields.");
        }

        setSubmittingExam(true);
        try {
            await api.post("/exams", {
                courseId,
                venueId,
                name: examName,
                date: examDate,
                maxMarks
            });
            setSuccess("Exam scheduled successfully!");
            setExamName("");
            setExamDate("");
            fetchLecturerAdminData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to schedule exam");
        } finally {
            setSubmittingExam(false);
        }
    };

    const handleOpenGrading = async (exam) => {
        setGradingExam(exam);
        setError(null);
        setSuccess(null);
        try {
            // 1. Fetch all students enrolled in the exam's course
            const enrollmentsRes = await api.get(`/enrollments?courseId=${exam.courseId._id}`);
            const students = enrollmentsRes.data.data.filter(e => e.status === "approved").map(e => e.studentId);
            setEnrolledStudents(students);

            // 2. Fetch existing results if any
            const resultsRes = await api.get(`/exams/${exam._id}/results`);
            const existingResults = resultsRes.data.data || [];
            
            // Prefill scores
            const initialScores = {};
            students.forEach(student => {
                const result = existingResults.find(r => r.studentId?._id === student._id);
                initialScores[student._id] = result ? result.score : "";
            });
            setStudentScores(initialScores);
        } catch (err) {
            console.error("Failed to initialize grading sheet:", err);
            setError("Could not retrieve course student roster.");
        }
    };

    const handleSaveGrades = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        setSavingGrades(true);

        const studentMarks = Object.keys(studentScores).map(studentId => ({
            studentId,
            score: parseFloat(studentScores[studentId]) || 0
        }));

        try {
            await api.post(`/exams/${gradingExam._id}/marks`, { studentMarks });
            setSuccess("Exam marks saved successfully!");
            setGradingExam(null);
            fetchLecturerAdminData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to save exam marks.");
        } finally {
            setSavingGrades(false);
        }
    };

    const handlePublishResults = async (examId) => {
        setError(null);
        setSuccess(null);
        if (!window.confirm("Publishing results will update official student transcripts and recalculate GPAs. Proceed?")) return;

        try {
            await api.post(`/exams/${examId}/publish`);
            setSuccess("Exam results successfully published and student GPAs updated!");
            fetchLecturerAdminData();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to publish exam results.");
        }
    };

    if (loading) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="skeleton mt-8" style={{ height: "300px" }}></div>
            </div>
        );
    }

    if (isStudent) {
        // STUDENT REPORT CARD VIEW
        return (
            <div className="animate-fade-in p-6 max-w-4xl mx-auto">
                <div className="mb-8 border-b pb-4">
                    <span className="badge badge-info mb-2 text-sm px-3 py-1 uppercase tracking-wide">Academic Record</span>
                    <h1 className="text-3xl font-extrabold text-gray-800 font-heading">My Examination Results</h1>
                    <p className="text-gray-500 text-sm mt-1">Official statement of published grades and cumulative GPA at SVIAS.</p>
                </div>

                {error && <div className="alert alert-danger mb-4">{error}</div>}

                {reportCard ? (
                    <div className="flex flex-col gap-8">
                        {/* GPA Display Card */}
                        <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 text-white rounded-2xl p-6 shadow-md flex justify-between items-center" style={{ background: "linear-gradient(135deg, #4f46e5, #6366f1)" }}>
                            <div>
                                <div className="text-xs uppercase font-bold tracking-wider opacity-75">Cumulative GPA</div>
                                <div className="text-3xl font-extrabold mt-1">{reportCard.gpa.toFixed(2)} / 4.00</div>
                                <div className="text-xs mt-2 opacity-90">Based on all published semester course exams.</div>
                            </div>
                            <div className="p-3 bg-white/10 rounded-xl">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ width: "40px", height: "40px" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                </svg>
                            </div>
                        </div>

                        {/* Results Table */}
                        <div className="glass-card-static" style={{ borderRadius: "20px", border: "1px solid var(--border-color)", padding: "1.5rem" }}>
                            <h3 className="text-lg font-bold mb-4 font-heading border-b pb-2" style={{ color: "var(--text-main)" }}>Graded Course Summary</h3>
                            
                            {reportCard.results.length === 0 ? (
                                <p className="text-gray-400 italic text-sm text-center py-6">No exam grades have been published for you yet.</p>
                            ) : (
                                <div className="table-responsive">
                                    <table className="premium-table">
                                        <thead>
                                            <tr>
                                                <th>Code</th>
                                                <th>Course Name</th>
                                                <th>Credits</th>
                                                <th>Marks</th>
                                                <th>Grade</th>
                                                <th>GP</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportCard.results.map((r, idx) => (
                                                <tr key={idx}>
                                                    <td style={{ color: "var(--primary-400)", fontWeight: "bold" }}>{r.courseCode}</td>
                                                    <td>{r.courseName}</td>
                                                    <td>{r.credits}</td>
                                                    <td>{r.score} / {r.totalMarks}</td>
                                                    <td>
                                                        <span className={`badge badge-${r.grade === "F" ? "danger" : "success"}`} style={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                                                            {r.grade}
                                                        </span>
                                                    </td>
                                                    <td style={{ fontWeight: "bold" }}>{r.gradePoints.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="empty-state">
                        <h3 className="font-bold text-gray-700">Report card unavailable</h3>
                        <p className="text-gray-400 text-sm mt-1">Please contact your administrator to verify your academic records.</p>
                    </div>
                )}
            </div>
        );
    }

    // LECTURER & ADMIN EXAM OFFICE DASHBOARD
    return (
        <div className="animate-fade-in p-6">
            <div className="mb-6 border-b pb-4">
                <span className="badge badge-info mb-2 text-sm px-3 py-1 uppercase tracking-wide">Exam Operations</span>
                <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>Academic Exam Registry</h1>
                <p className="page-subtitle" style={{ margin: 0 }}>Schedule department exams, record student scores, and publish final grade points.</p>
            </div>

            {error && <div className="alert alert-danger mb-4">{error}</div>}
            {success && <div className="alert alert-success mb-4">{success}</div>}

            <div className="form-row" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "2rem" }}>
                
                {/* 1. EXAM REGISTRY LIST */}
                <div className="glass-card-static" style={{ display: "flex", flexDirection: "column" }}>
                    <h3>Scheduled Exams ({exams.length})</h3>
                    {exams.length === 0 ? (
                        <div className="empty-state" style={{ padding: "4rem 2rem", flex: 1 }}>
                            <div className="empty-state-title">No exams scheduled</div>
                            <div className="empty-state-text">Use the scheduler form on the right to register a new course exam.</div>
                        </div>
                    ) : (
                        <div className="table-responsive" style={{ marginTop: "1rem" }}>
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>Course</th>
                                        <th>Exam Name</th>
                                        <th>Date & Time</th>
                                        <th>Venue</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {exams.map(exam => (
                                        <tr key={exam._id}>
                                            <td><strong style={{ color: "var(--primary-400)" }}>{exam.courseId?.code}</strong></td>
                                            <td>{exam.name}</td>
                                            <td>{new Date(exam.date).toLocaleString()}</td>
                                            <td>{exam.venueId?.name || "Unassigned"}</td>
                                            <td>
                                                <span className={`badge badge-${
                                                    exam.status === "published" ? "success" : exam.status === "completed" ? "info" : "student"
                                                }`} style={{ fontSize: "0.7rem", fontWeight: "700" }}>
                                                    {exam.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                                    {exam.status !== "published" && (
                                                        <button 
                                                            onClick={() => handleOpenGrading(exam)} 
                                                            className="btn btn-primary btn-sm"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem" }}
                                                        >
                                                            Grade
                                                        </button>
                                                    )}
                                                    {exam.status === "completed" && (
                                                        <button 
                                                            onClick={() => handlePublishResults(exam._id)} 
                                                            className="btn btn-outline btn-sm"
                                                            style={{ padding: "0.25rem 0.6rem", fontSize: "0.75rem", color: "#10b981", borderColor: "#10b981" }}
                                                        >
                                                            Publish
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* 2. RIGHT SIDEBAR: EXAM FORM / GRADE BOOK */}
                <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
                    
                    {/* GRADE BOOK INPUT SHEET */}
                    {gradingExam && (
                        <div className="glass-card-static animate-scale-in" style={{ borderColor: "#818cf8" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                                <h3 style={{ margin: 0 }}>Grade Book</h3>
                                <span className="badge badge-student" style={{ fontSize: "0.7rem", fontWeight: "600" }}>{gradingExam.courseId?.code}</span>
                            </div>
                            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1rem" }}>
                                Entering scores for: <strong>{gradingExam.name}</strong> (Max: {gradingExam.maxMarks} marks).
                            </p>
                            
                            {enrolledStudents.length === 0 ? (
                                <p className="text-gray-400 italic text-sm py-4">No approved student enrollments found for this course.</p>
                            ) : (
                                <form onSubmit={handleSaveGrades}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", paddingRight: "0.5rem", marginBottom: "1.5rem" }}>
                                        {enrolledStudents.map(student => (
                                            <div key={student._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: "0.5rem" }}>
                                                <div style={{ minWidth: 0, flex: 1 }}>
                                                    <div style={{ fontSize: "0.9rem", fontWeight: "600", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}>
                                                        {student.name}
                                                    </div>
                                                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                                                        {student.registrationNumber || "Reg No Pending"}
                                                    </div>
                                                </div>
                                                <input 
                                                    type="number" 
                                                    className="form-input" 
                                                    max={gradingExam.maxMarks} 
                                                    min={0}
                                                    step="0.5"
                                                    placeholder="Marks"
                                                    value={studentScores[student._id] ?? ""}
                                                    onChange={e => setStudentScores({ ...studentScores, [student._id]: e.target.value })}
                                                    style={{ width: "90px", padding: "0.4rem 0.6rem", textAlign: "center" }}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} disabled={savingGrades}>
                                            {savingGrades ? "Saving..." : "Save Marks Sheet"}
                                        </button>
                                        <button type="button" onClick={() => setGradingExam(null)} className="btn btn-outline">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* SCHEDULE EXAM FORM */}
                    <div className="glass-card-static">
                        <h3>Schedule New Exam</h3>
                        <form onSubmit={handleScheduleExam} style={{ marginTop: "1.25rem" }}>
                            
                            <div className="form-group">
                                <label>Course Unit</label>
                                <select 
                                    className="form-input" 
                                    value={courseId} 
                                    onChange={e => setCourseId(e.target.value)} 
                                    style={{ background: "var(--background-dark)" }}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Exam Title</label>
                                <input 
                                    type="text" 
                                    className="form-input" 
                                    placeholder="e.g. End Semester Theory Paper" 
                                    value={examName}
                                    onChange={e => setExamName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Date & Stating Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-input" 
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Allocated Venue</label>
                                <select 
                                    className="form-input" 
                                    value={venueId} 
                                    onChange={e => setVenueId(e.target.value)} 
                                    style={{ background: "var(--background-dark)" }}
                                    required
                                >
                                    <option value="">-- Select Exam Room --</option>
                                    {venues.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.location})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Maximum Marks</label>
                                <input 
                                    type="number" 
                                    className="form-input" 
                                    value={maxMarks}
                                    onChange={e => setMaxMarks(parseInt(e.target.value))}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "1rem", justifyContent: "center" }} disabled={submittingExam}>
                                {submittingExam ? "Scheduling..." : "Schedule Exam"}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ExamsPage;

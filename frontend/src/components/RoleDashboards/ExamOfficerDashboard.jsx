import { useState, useEffect } from "react";
import api from "../../services/api";

const ExamOfficerDashboard = () => {
    const [exams, setExams] = useState([]);
    const [courses, setCourses] = useState([]);
    const [venues, setVenues] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // New Exam State
    const [newExam, setNewExam] = useState({
        courseId: "",
        name: "",
        date: "",
        venueId: "",
        maxMarks: 100
    });

    // Enter Marks State
    const [gradingExam, setGradingExam] = useState(null);
    const [marksSheet, setMarksSheet] = useState([]); // Array of { studentId, name, registrationNumber, score }

    // Transcript State
    const [selectedStudent, setSelectedStudent] = useState("");
    const [transcript, setTranscript] = useState(null);

    const [message, setMessage] = useState({ text: "", type: "" });

    const loadDashboardData = async () => {
        try {
            const [examsRes, coursesRes, venuesRes, studentsRes] = await Promise.all([
                api.get("/exams"),
                api.get("/courses"),
                api.get("/events/venues"),
                api.get("/users?role=student")
            ]);
            setExams(examsRes.data.data);
            setCourses(coursesRes.data.data);
            setVenues(venuesRes.data.data);
            setStudents(studentsRes.data.data);
        } catch (err) {
            console.error("Failed to load Exam Officer data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDashboardData();
    }, []);

    // Create a new exam
    const handleCreateExam = async (e) => {
        e.preventDefault();
        if (!newExam.courseId || !newExam.name || !newExam.date || !newExam.venueId) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await api.post("/exams", newExam);
            setMessage({ text: "Exam scheduled successfully!", type: "success" });
            setNewExam({ courseId: "", name: "", date: "", venueId: "", maxMarks: 100 });
            loadDashboardData();
        } catch (err) {
            console.error("Failed to create exam:", err);
            setMessage({ text: err.response?.data?.message || "Failed to schedule exam.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Open inline marks sheet for a specific exam
    const openMarksSheet = async (exam) => {
        setGradingExam(exam);
        setActionLoading(true);
        
        try {
            // Get enrolled students for the course
            const courseRes = await api.get(`/courses/${exam.courseId._id || exam.courseId}`);
            const enrolled = courseRes.data.data.enrolledStudents;

            // Fetch existing marks if any
            const resultsRes = await api.get(`/exams/${exam._id}/results`);
            const existingResults = resultsRes.data.data;

            const sheet = enrolled.map(st => {
                const existing = existingResults.find(r => r.studentId._id === st._id || r.studentId === st._id);
                return {
                    studentId: st._id,
                    name: st.name,
                    registrationNumber: st.registrationNumber || st.studentId || "S-000",
                    score: existing ? existing.score : ""
                };
            });

            setMarksSheet(sheet);
        } catch (err) {
            console.error("Failed to load marks sheet:", err);
            setMessage({ text: "Failed to load marks sheet.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Submit marks sheet
    const handleSaveMarks = async (e) => {
        e.preventDefault();
        if (!gradingExam) return;

        setActionLoading(true);
        try {
            const submission = marksSheet.map(item => ({
                studentId: item.studentId,
                score: Number(item.score || 0)
            }));

            await api.post(`/exams/${gradingExam._id}/marks`, { studentMarks: submission });
            setMessage({ text: "Exam marks saved successfully!", type: "success" });
            setGradingExam(null);
            loadDashboardData();
        } catch (err) {
            console.error("Failed to save marks:", err);
            setMessage({ text: "Failed to submit marks sheet.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Publish exam results
    const handlePublishResults = async (examId) => {
        setActionLoading(true);
        try {
            await api.post(`/exams/${examId}/publish`);
            setMessage({ text: "Results published and student GPAs updated!", type: "success" });
            loadDashboardData();
        } catch (err) {
            console.error("Failed to publish results:", err);
            setMessage({ text: "Failed to publish results.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Generate Transcript
    const handleGetTranscript = async (e) => {
        e.preventDefault();
        if (!selectedStudent) return;

        setActionLoading(true);
        setTranscript(null);
        try {
            const res = await api.get(`/exams/student/${selectedStudent}/transcript`);
            setTranscript(res.data.data);
        } catch (err) {
            console.error("Failed to generate transcript:", err);
            setMessage({ text: "Failed to load student transcript.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "350px", height: "2.5rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "200px", height: "1.2rem", marginBottom: "2rem" }}></div>
                <div className="stats-grid">
                    {[1, 2].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "130px" }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6">
            <div className="mb-6">
                <span className="badge badge-danger mb-2 text-sm px-3 py-1 uppercase tracking-wide">Examination Control Desk</span>
                <h1 className="text-3xl font-bold text-gray-800 font-heading">Swami Vipulananda Institute of Aesthetic Studies</h1>
                <p className="text-gray-500 text-sm mt-1">Manage exam calendars, enter student scores, verify grades, and print transcripts.</p>
            </div>

            {/* Notification alert */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {message.text}
                </div>
            )}

            {/* Dashboards Section */}
            {!gradingExam && !transcript ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Exam Schedule */}
                    <div className="lg:col-span-2 glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                            </svg>
                            Exam Administration Registry
                        </h3>

                        <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto">
                            {exams.length === 0 ? (
                                <p className="text-gray-400 italic text-sm p-4 text-center">No exams scheduled in this semester.</p>
                            ) : (
                                exams.map(ex => (
                                    <div key={ex._id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:border-red-200 transition">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">{ex.courseId.code}</span>
                                                <span className="font-bold text-gray-800">{ex.name}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-2 flex flex-col sm:flex-row sm:gap-4 gap-1">
                                                <span>📅 Date: {new Date(ex.date).toLocaleString()}</span>
                                                <span>🏛️ Venue: {ex.venueId?.name || "No Venue Allocated"}</span>
                                                <span>💯 Max Marks: {ex.maxMarks}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-start md:self-center">
                                            {ex.status === "scheduled" && (
                                                <>
                                                    <span className="text-xs font-bold bg-amber-50 text-amber-700 px-3 py-1 rounded-full uppercase tracking-wider">Scheduled</span>
                                                    <button 
                                                        onClick={() => openMarksSheet(ex)}
                                                        className="btn btn-outline btn-sm text-xs border-amber-500 text-amber-700 hover:bg-amber-50"
                                                    >
                                                        Enter Grades
                                                    </button>
                                                </>
                                            )}
                                            {ex.status === "completed" && (
                                                <>
                                                    <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full uppercase tracking-wider">Graded (Draft)</span>
                                                    <button 
                                                        onClick={() => handlePublishResults(ex._id)}
                                                        disabled={actionLoading}
                                                        className="btn btn-primary btn-sm text-xs bg-red-700 hover:bg-red-800 text-white"
                                                    >
                                                        Publish Results
                                                    </button>
                                                    <button 
                                                        onClick={() => openMarksSheet(ex)}
                                                        className="btn btn-outline btn-sm text-xs"
                                                    >
                                                        Edit Marks
                                                    </button>
                                                </>
                                            )}
                                            {ex.status === "published" && (
                                                <>
                                                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1 rounded-full uppercase tracking-wider">Published</span>
                                                    <button 
                                                        onClick={() => openMarksSheet(ex)}
                                                        className="btn btn-outline btn-sm text-xs border-blue-500 text-blue-700 hover:bg-blue-50"
                                                    >
                                                        View Scoresheet
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Left Column Controls */}
                    <div className="flex flex-col gap-6">
                        {/* Schedule Exam */}
                        <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-800 mb-4 font-heading border-b pb-2">Schedule Examination</h3>
                            <form onSubmit={handleCreateExam} className="flex flex-col gap-3">
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Select Course</label>
                                    <select 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                        value={newExam.courseId}
                                        onChange={e => setNewExam(prev => ({ ...prev, courseId: e.target.value }))}
                                        required
                                    >
                                        <option value="">-- Choose Course --</option>
                                        {courses.map(c => (
                                            <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Exam Name</label>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2"
                                        placeholder="e.g. End-Semester Theory Exam"
                                        value={newExam.name}
                                        onChange={e => setNewExam(prev => ({ ...prev, name: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Date & Time</label>
                                    <input 
                                        type="datetime-local" 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2"
                                        value={newExam.date}
                                        onChange={e => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                                        required
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Select Venue</label>
                                    <select 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                        value={newExam.venueId}
                                        onChange={e => setNewExam(prev => ({ ...prev, venueId: e.target.value }))}
                                        required
                                    >
                                        <option value="">-- Choose Venue --</option>
                                        {venues.map(v => (
                                            <option key={v._id} value={v._id}>{v.name} ({v.type})</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="btn btn-primary text-white bg-red-700 hover:bg-red-800 rounded-lg p-2 font-bold text-sm w-full mt-2"
                                >
                                    {actionLoading ? "Scheduling..." : "Schedule Exam"}
                                </button>
                            </form>
                        </div>

                        {/* Print Transcript Request */}
                        <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                            <h3 className="text-base font-bold text-gray-800 mb-4 font-heading border-b pb-2">Academic Transcript Desk</h3>
                            <form onSubmit={handleGetTranscript} className="flex flex-col gap-3">
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Select Student</label>
                                    <select 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                        value={selectedStudent}
                                        onChange={e => setSelectedStudent(e.target.value)}
                                        required
                                    >
                                        <option value="">-- Choose Student --</option>
                                        {students.map(s => (
                                            <option key={s._id} value={s._id}>{s.name} ({s.registrationNumber || s.email})</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="btn btn-outline rounded-lg p-2 font-bold text-sm w-full mt-2"
                                >
                                    Compile Academic Record
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : gradingExam ? (
                // Enter Marks Sheet
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-lg animate-slide-up">
                    <div className="flex justify-between items-center border-b pb-3 mb-6">
                        <div>
                            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded mr-2">{gradingExam.courseId.code}</span>
                            <h3 className="text-xl font-bold text-gray-800 inline-block font-heading">{gradingExam.name} - Marks Entry Sheet</h3>
                        </div>
                        <button 
                            onClick={() => setGradingExam(null)}
                            className="text-gray-400 hover:text-gray-600 font-bold"
                        >
                            Back to Dashboard
                        </button>
                    </div>

                    <form onSubmit={handleSaveMarks} className="flex flex-col gap-4">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50 font-bold text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-3 text-left">Reg No</th>
                                        <th className="px-6 py-3 text-left">Student Name</th>
                                        <th className="px-6 py-3 text-left">Score ({gradingExam.maxMarks} max)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {marksSheet.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="px-6 py-4 text-center text-gray-400 italic">No students enrolled in this course.</td>
                                        </tr>
                                    ) : (
                                        marksSheet.map((item, idx) => (
                                            <tr key={item.studentId}>
                                                <td className="px-6 py-4 font-semibold text-red-800">{item.registrationNumber}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800">{item.name}</td>
                                                <td className="px-6 py-4">
                                                    <input 
                                                        type="number"
                                                        className="form-input rounded-lg border-gray-200 p-1 w-32 bg-gray-50 focus:bg-white text-center font-bold"
                                                        max={gradingExam.maxMarks}
                                                        min={0}
                                                        value={item.score}
                                                        onChange={e => {
                                                            const newSheet = [...marksSheet];
                                                            newSheet[idx].score = e.target.value;
                                                            setMarksSheet(newSheet);
                                                        }}
                                                        disabled={gradingExam.status === "published"}
                                                        placeholder="Enter marks"
                                                        required
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        
                        {gradingExam.status !== "published" && (
                            <div className="flex justify-end gap-3 mt-4">
                                <button 
                                    type="button"
                                    onClick={() => setGradingExam(null)}
                                    className="btn btn-outline rounded-lg px-6"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={actionLoading}
                                    className="btn btn-primary bg-emerald-600 text-white hover:bg-emerald-700 rounded-lg px-8 font-bold"
                                >
                                    {actionLoading ? "Saving..." : "Save Marks Ledger"}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            ) : (
                // Transcript Card View
                <div className="glass-card-static bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-3xl mx-auto animate-slide-up">
                    <div className="flex justify-between items-center border-b pb-4 mb-6">
                        <h3 className="text-xl font-bold text-gray-800 font-heading">Student Academic Transcript</h3>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => window.print()}
                                className="btn btn-outline btn-sm font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                            >
                                Print Transcript
                            </button>
                            <button 
                                onClick={() => setTranscript(null)}
                                className="text-gray-400 hover:text-gray-600 font-semibold text-sm"
                            >
                                Close View
                            </button>
                        </div>
                    </div>

                    {transcript && (
                        <div className="p-6 border border-gray-200 rounded-2xl bg-white shadow-sm flex flex-col gap-6 print:p-0 print:border-none print:shadow-none">
                            {/* University Header */}
                            <div className="text-center border-b pb-4">
                                <h2 className="text-xl font-bold text-gray-800 uppercase font-heading">{transcript.institute}</h2>
                                <h4 className="text-sm font-bold text-gray-500 uppercase mt-1">{transcript.affiliation}</h4>
                                <h5 className="text-xs text-gray-400 mt-2">OFFICIAL ACADEMIC STATEMENT</h5>
                            </div>

                            {/* Student Info */}
                            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4">
                                <div>
                                    <div className="text-gray-400 text-xs uppercase font-bold">Student Name</div>
                                    <div className="font-bold text-gray-800 mt-0.5">{transcript.student.name}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs uppercase font-bold">Registration Number</div>
                                    <div className="font-bold text-red-800 mt-0.5">{transcript.student.registrationNumber}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs uppercase font-bold">Academic Department</div>
                                    <div className="font-bold text-gray-800 mt-0.5">{transcript.student.department}</div>
                                </div>
                                <div>
                                    <div className="text-gray-400 text-xs uppercase font-bold">Statement Issued Date</div>
                                    <div className="font-bold text-gray-800 mt-0.5">{new Date(transcript.generatedAt).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Grade sheet */}
                            <div>
                                <table className="min-w-full text-sm divide-y divide-gray-200">
                                    <thead className="font-bold text-gray-500 uppercase text-xs">
                                        <tr>
                                            <th className="py-2 text-left">Code</th>
                                            <th className="py-2 text-left">Course Name</th>
                                            <th className="py-2 text-center">Credits</th>
                                            <th className="py-2 text-center">Grade</th>
                                            <th className="py-2 text-center">Points</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {transcript.courses.map(c => (
                                            <tr key={c.code} className="text-gray-700">
                                                <td className="py-3 font-semibold text-red-800 text-left">{c.code}</td>
                                                <td className="py-3 text-left font-medium">{c.name}</td>
                                                <td className="py-3 text-center">{c.credits}</td>
                                                <td className="py-3 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        c.grade === "F" ? "bg-red-50 text-red-700" : c.grade === "In Progress" ? "bg-gray-100 text-gray-700" : "bg-emerald-50 text-emerald-700"
                                                    }`}>
                                                        {c.grade}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-center font-semibold">{c.gradePoints !== null ? c.gradePoints.toFixed(2) : "-"}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Cumulative Stats */}
                            <div className="border-t pt-4 flex justify-between items-center bg-gray-50 p-4 rounded-xl">
                                <span className="font-bold text-gray-600 uppercase text-sm">Cumulative Grade Point Average (GPA):</span>
                                <span className="text-2xl font-extrabold text-red-800">{transcript.gpa.toFixed(2)} / 4.00</span>
                            </div>

                            {/* Signatures */}
                            <div className="flex justify-between items-end mt-10 border-t pt-8 text-xs text-gray-400 font-bold uppercase">
                                <div className="text-center w-36">
                                    <div className="border-b border-gray-300 h-10 w-full mb-2"></div>
                                    <span>Head of Department</span>
                                </div>
                                <div className="text-center w-36">
                                    <div className="border-b border-gray-300 h-10 w-full mb-2"></div>
                                    <span>Assistant Registrar</span>
                                </div>
                                <div className="text-center w-36">
                                    <div className="border-b border-gray-300 h-10 w-full mb-2"></div>
                                    <span>Examination Officer</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ExamOfficerDashboard;

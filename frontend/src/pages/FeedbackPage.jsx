import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const FeedbackPage = () => {
    const { user } = useContext(AuthContext);
    const [feedbacks, setFeedbacks] = useState([]);
    const [myCourses, setMyCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    
    // New Feedback Form State
    const [newFeedback, setNewFeedback] = useState({
        type: "course",
        courseId: "",
        rating: 5,
        comments: ""
    });

    const [message, setMessage] = useState({ text: "", type: "" });

    const loadFeedbackData = async () => {
        try {
            if (user.role === "student") {
                // Load approved courses for student
                const coursesRes = await api.get("/enrollments/student/me");
                const activeCourses = coursesRes.data.data.filter(e => e.status === "approved").map(e => e.courseId);
                setMyCourses(activeCourses);
            } else {
                // Load incoming feedbacks
                const feedbackRes = await api.get("/feedbacks");
                setFeedbacks(feedbackRes.data.data);
            }
        } catch (err) {
            console.error("Failed to load feedback resources:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            loadFeedbackData();
        }
    }, [user]);

    // Submit Feedback Handler
    const handleSubmitFeedback = async (e) => {
        e.preventDefault();
        if (!newFeedback.courseId || !newFeedback.comments) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const selectedCourse = myCourses.find(c => c._id === newFeedback.courseId);
            const lecturerId = selectedCourse?.lecturerId;

            await api.post("/feedbacks", {
                type: newFeedback.type,
                courseId: newFeedback.courseId,
                toUser: newFeedback.type === "lecturer" ? lecturerId : undefined,
                rating: Number(newFeedback.rating),
                comments: newFeedback.comments
            });

            setMessage({ text: "Feedback submitted successfully! Thank you for helping us improve.", type: "success" });
            setNewFeedback({ type: "course", courseId: "", rating: 5, comments: "" });
        } catch (err) {
            console.error("Feedback submission failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to submit feedback.", type: "error" });
        } finally {
            setActionLoading(false);
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

    const isStudent = user?.role === "student";

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-gray-800 font-heading">Course & Instructor Feedbacks</h1>
                <p className="text-gray-500 text-sm mt-1">SVIAS evaluation survey desk. Share your learning experience anonymously to improve academic quality.</p>
            </div>

            {/* Alert Notification */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    {message.text}
                </div>
            )}

            {isStudent ? (
                // Student Survey Form
                <div className="glass-card-static bg-white p-8 rounded-2xl border border-gray-200 shadow-md max-w-2xl mx-auto">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-heading border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Course Evaluation Form
                    </h3>
                    
                    <form onSubmit={handleSubmitFeedback} className="flex flex-col gap-4">
                        <div className="form-group flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Feedback Target</label>
                            <div className="flex gap-4 text-sm font-semibold mt-1">
                                <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="fbType" 
                                        value="course"
                                        checked={newFeedback.type === "course"}
                                        onChange={() => setNewFeedback(prev => ({ ...prev, type: "course" }))}
                                    />
                                    Evaluate Course Structure
                                </label>
                                <label className="flex items-center gap-1.5 text-gray-700 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="fbType" 
                                        value="lecturer"
                                        checked={newFeedback.type === "lecturer"}
                                        onChange={() => setNewFeedback(prev => ({ ...prev, type: "lecturer" }))}
                                    />
                                    Evaluate Lecturer Delivery
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select Course</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newFeedback.courseId}
                                    onChange={e => setNewFeedback(prev => ({ ...prev, courseId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {myCourses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Overall Rating</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white font-bold"
                                    value={newFeedback.rating}
                                    onChange={e => setNewFeedback(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    required
                                >
                                    <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                                    <option value="4">⭐⭐⭐⭐ Very Good (4)</option>
                                    <option value="3">⭐⭐⭐ Good (3)</option>
                                    <option value="2">⭐⭐ Fair (2)</option>
                                    <option value="1">⭐ Poor (1)</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Comments & Suggestions</label>
                            <textarea 
                                className="form-input rounded-lg border-gray-200 text-sm p-3 h-28 leading-relaxed"
                                placeholder="Describe your experience with the course contents, material quality, or lecture timing. Please provide constructive feedback."
                                value={newFeedback.comments}
                                onChange={e => setNewFeedback(prev => ({ ...prev, comments: e.target.value }))}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={actionLoading}
                            className="btn btn-primary bg-red-700 text-white hover:bg-red-800 rounded-lg p-2.5 font-bold text-sm w-full mt-4"
                        >
                            {actionLoading ? "Submitting..." : "Submit Anonymous Survey"}
                        </button>
                    </form>
                </div>
            ) : (
                // Admin, HOD, and Lecturer Feedback Logs View
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-6 font-heading border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        Department Evaluation Logs
                    </h3>

                    {feedbacks.length === 0 ? (
                        <p className="text-gray-400 italic text-sm text-center py-6">No evaluation survey submissions logged yet.</p>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {feedbacks.map(fb => (
                                <div key={fb._id} className="p-4 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:border-red-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded uppercase">{fb.type} feedback</span>
                                            <span className="text-xs font-bold text-gray-800">{fb.courseId?.code}</span>
                                            <span className="text-gray-400 font-bold text-xs">By Anonymous Student</span>
                                        </div>
                                        <p className="text-gray-600 text-sm mt-3 italic leading-relaxed">"{fb.comments}"</p>
                                    </div>
                                    <div className="text-right self-start sm:self-center flex flex-col items-end gap-1.5 whitespace-nowrap">
                                        <span className="text-amber-500 font-extrabold text-lg">
                                            {"★".repeat(fb.rating)}
                                            <span className="text-gray-200">{"★".repeat(5 - fb.rating)}</span>
                                        </span>
                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(fb.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default FeedbackPage;

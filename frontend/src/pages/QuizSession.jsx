import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

const QuizSession = () => {
    const { courseId, quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({}); // { questionId: value }
    const [timeLeft, setTimeLeft] = useState(0);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // Keep answers ref updated so timer doesn't depend on answers state directly
    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        const startAttempt = async () => {
            try {
                const res = await api.post(`/quizzes/${quizId}/attempt`);
                setQuiz(res.data.data.quiz);
                setQuestions(res.data.data.questions);
                // Initialize timer
                setTimeLeft(res.data.data.quiz.durationMinutes * 60);
                
                // Initialize empty answers
                const initAnswers = {};
                res.data.data.questions.forEach(q => {
                    initAnswers[q._id] = q.type === "mcq" ? "" : q.type === "true_false" ? "true" : "";
                });
                setAnswers(initAnswers);
            } catch (err) {
                console.error(err);
                setError(err.response?.data?.message || "Failed to load quiz attempt session.");
            } finally {
                setLoading(false);
            }
        };

        startAttempt();
    }, [quizId]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const submitQuiz = useCallback(async (answersPayload) => {
        setSubmitting(true);
        try {
            const res = await api.post(`/quizzes/${quizId}/submit`, {
                answers: Object.keys(answersPayload).map(qId => ({
                    questionId: qId,
                    value: answersPayload[qId]
                }))
            });
            alert(res.data.message || "Quiz submitted successfully!");
            navigate(`/courses/${courseId}`);
        } catch (err) {
            alert(err.response?.data?.message || "Submit failed.");
        } finally {
            setSubmitting(false);
        }
    }, [quizId, courseId, navigate]);

    // Timer Countdown Logic
    useEffect(() => {
        if (timeLeft <= 0 || loading || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Trigger auto-submit when timer expires
                    alert("⌛ Time has expired! Your quiz answers are being automatically submitted.");
                    submitQuiz(answersRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, submitting, submitQuiz]);

    const handleSubmitClick = (e) => {
        e.preventDefault();
        if (window.confirm("Are you sure you want to finish and submit your quiz answers?")) {
            submitQuiz(answers);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    };

    if (loading) {
        return (
            <div className="loading-spinner" style={{ minHeight: "60vh" }}>
                <div className="spinner"></div>
                <p className="loading-text">Initializing quiz session securely...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container" style={{ padding: "3rem 0", maxWidth: "600px" }}>
                <div className="glass-card-static">
                    <div className="alert alert-danger" style={{ marginBottom: "1.5rem" }}>{error}</div>
                    <button onClick={() => navigate(`/courses/${courseId}`)} className="btn btn-outline" style={{ width: "100%" }}>
                        Back to Course Workspace
                    </button>
                </div>
            </div>
        );
    }

    // Progress Calculation
    const answeredCount = questions.filter(q => {
        const ans = answers[q._id];
        if (ans === undefined || ans === null) return false;
        if (q.type === "mcq" || q.type === "true_false") return ans !== "";
        return ans.trim() !== "";
    }).length;
    const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

    const optionLetters = ["A", "B", "C", "D", "E", "F"];

    return (
        <div className="container" style={{ padding: "3rem 0", maxWidth: "800px" }}>
            
            {/* Timed countdown alert bar */}
            <div className="quiz-timer-header animate-slide-down" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem", borderRadius: "16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <div className="empty-state-icon" style={{ padding: 0, background: "none", color: "var(--error)" }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "24px", height: "24px" }} className="animate-pulse">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                    </div>
                    <div>
                        <h4 style={{ fontSize: "1.1rem", color: "var(--error)", margin: 0, fontWeight: "700" }}>Timed Exam Session Active</h4>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Do not close or refresh this tab!</span>
                    </div>
                </div>
                <div className="font-mono" style={{ fontSize: "2rem", fontWeight: "700", color: "var(--error)", letterSpacing: "1px" }}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Quiz Progress Bar */}
            <div className="glass-card-static animate-slide-up stagger-1" style={{ padding: "1.25rem 1.5rem", borderRadius: "16px", marginBottom: "1.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.5rem" }}>
                    <span>Exam Progress</span>
                    <span><strong>{answeredCount}</strong> of {questions.length} questions completed ({Math.round(progressPercent)}%)</span>
                </div>
                <div className="quiz-progress-bar">
                    <div className="quiz-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                </div>
            </div>

            <div className="glass-card-static animate-slide-up stagger-2" style={{ borderRadius: "16px" }}>
                <h2 style={{ marginBottom: "0.5rem" }}>{quiz.title}</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2.5rem" }}>{quiz.description || "Answer all questions to the best of your abilities."}</p>

                <form onSubmit={handleSubmitClick}>
                    {questions.map((q, idx) => (
                        <div key={q._id} className="glass-card-inner" style={{ marginBottom: "2rem", padding: "1.5rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem", borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "0.75rem" }}>
                                <h4 style={{ fontSize: "1.05rem", margin: 0, fontWeight: "600", color: "var(--text-main)", lineHeight: "1.4" }}>
                                    {idx + 1}. {q.text}
                                </h4>
                                <span className="badge badge-student" style={{ fontSize: "0.7rem", padding: "0.15rem 0.4rem", whiteSpace: "nowrap" }}>{q.points} Points</span>
                            </div>

                            {q.type === "mcq" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    {q.options.map((opt, optIdx) => {
                                        const isSelected = answers[q._id] === optIdx.toString();
                                        return (
                                            <label 
                                                key={optIdx} 
                                                className={`quiz-option ${isSelected ? "selected" : ""}`}
                                            >
                                                <input 
                                                    type="radio" 
                                                    name={`question-${q._id}`} 
                                                    value={optIdx.toString()} 
                                                    checked={isSelected}
                                                    onChange={() => handleAnswerChange(q._id, optIdx.toString())} 
                                                    className="sr-only"
                                                />
                                                <div className="quiz-option-letter">{optionLetters[optIdx]}</div>
                                                <div className="quiz-option-text">{opt}</div>
                                            </label>
                                        );
                                    })}
                                </div>
                            )}

                            {q.type === "true_false" && (
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <label className={`quiz-option ${answers[q._id] === "true" ? "selected" : ""}`} style={{ flex: 1, justifyContent: "center" }}>
                                        <input 
                                            type="radio" 
                                            name={`question-${q._id}`} 
                                            value="true" 
                                            checked={answers[q._id] === "true"}
                                            onChange={() => handleAnswerChange(q._id, "true")}
                                            className="sr-only"
                                        />
                                        <div className="quiz-option-letter">T</div>
                                        <div className="quiz-option-text">True</div>
                                    </label>
                                    <label className={`quiz-option ${answers[q._id] === "false" ? "selected" : ""}`} style={{ flex: 1, justifyContent: "center" }}>
                                        <input 
                                            type="radio" 
                                            name={`question-${q._id}`} 
                                            value="false" 
                                            checked={answers[q._id] === "false"}
                                            onChange={() => handleAnswerChange(q._id, "false")}
                                            className="sr-only"
                                        />
                                        <div className="quiz-option-letter">F</div>
                                        <div className="quiz-option-text">False</div>
                                    </label>
                                </div>
                            )}

                            {q.type === "short_answer" && (
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <textarea 
                                        className="form-input" 
                                        rows="3" 
                                        placeholder="Type your response explanation here..." 
                                        value={answers[q._id] || ""}
                                        onChange={e => handleAnswerChange(q._id, e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    ))}

                    <button 
                        type="submit" 
                        className="btn btn-primary" 
                        disabled={submitting} 
                        style={{ width: "100%", padding: "1rem", fontSize: "1rem", fontWeight: "600", display: "flex", justifyContent: "center", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}
                    >
                        {submitting ? (
                            <>
                                <div className="spinner" style={{ width: "18px", height: "18px", borderWidth: "2px" }}></div>
                                <span>Submitting Attempt...</span>
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "18px", height: "18px" }}>
                                    <polyline points="20 6 9 17 4 12"/>
                                </svg>
                                <span>Finish and Submit Quiz</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QuizSession;

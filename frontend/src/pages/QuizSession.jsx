import React, { useState, useEffect, useContext } from "react";
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

    // Timer Countdown Logic
    useEffect(() => {
        if (timeLeft <= 0 || loading || submitting) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    // Trigger auto-submit when timer expires
                    handleAutoSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, loading, submitting]);

    const handleAnswerChange = (qId, value) => {
        setAnswers(prev => ({
            ...prev,
            [qId]: value
        }));
    };

    const submitQuiz = async (answersPayload) => {
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
    };

    const handleAutoSubmit = () => {
        alert("⌛ Time has expired! Your quiz answers are being automatically submitted.");
        submitQuiz(answers);
    };

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

    if (loading) return <div className="text-center" style={{ marginTop: "5rem" }}>Initializing quiz session securely...</div>;
    if (error) return <div className="container" style={{ marginTop: "5rem" }}><div className="alert alert-danger">{error}</div><button onClick={() => navigate(`/courses/${courseId}`)} className="btn btn-outline">Back to Course Workspace</button></div>;

    return (
        <div className="container" style={{ padding: "3rem 0", maxWidth: "800px" }}>
            
            {/* Timed countdown alert bar */}
            <div className="quiz-timer-header">
                <div>
                    <h2 style={{ fontSize: "1.4rem", color: "var(--error)", margin: 0 }}>⏱ TIMED SESSION ACTIVE</h2>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>Do not close or reload this browser tab!</span>
                </div>
                <div style={{ fontSize: "2.2rem", fontFamily: "monospace", letterSpacing: "1px" }}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <div className="glass-card">
                <h2>{quiz.title}</h2>
                <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>{quiz.description || "Answer all questions to the best of your abilities."}</p>

                <form onSubmit={handleSubmitClick}>
                    {questions.map((q, idx) => (
                        <div key={q._id} style={{ marginBottom: "2.5rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem" }}>
                            <h4 style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                                {idx + 1}. {q.text} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "0.5rem" }}>({q.points} pts)</span>
                            </h4>

                            {q.type === "mcq" && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                                    {q.options.map((opt, optIdx) => (
                                        <label key={optIdx} style={{ display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "0.8rem 1rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                                            <input 
                                                type="radio" 
                                                name={`question-${q._id}`} 
                                                value={optIdx.toString()} 
                                                checked={answers[q._id] === optIdx.toString()}
                                                onChange={() => handleAnswerChange(q._id, optIdx.toString())} 
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                            )}

                            {q.type === "true_false" && (
                                <div style={{ display: "flex", gap: "1rem" }}>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "0.8rem 1.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", flex: 1, justifyContent: "center" }}>
                                        <input 
                                            type="radio" 
                                            name={`question-${q._id}`} 
                                            value="true" 
                                            checked={answers[q._id] === "true"}
                                            onChange={() => handleAnswerChange(q._id, "true")}
                                        />
                                        True
                                    </label>
                                    <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", cursor: "pointer", background: "rgba(255,255,255,0.02)", padding: "0.8rem 1.5rem", borderRadius: "6px", border: "1px solid var(--border-color)", flex: 1, justifyContent: "center" }}>
                                        <input 
                                            type="radio" 
                                            name={`question-${q._id}`} 
                                            value="false" 
                                            checked={answers[q._id] === "false"}
                                            onChange={() => handleAnswerChange(q._id, "false")}
                                        />
                                        False
                                    </label>
                                </div>
                            )}

                            {q.type === "short_answer" && (
                                <div className="form-group">
                                    <textarea 
                                        className="form-input" 
                                        rows="3" 
                                        placeholder="Type your response explanation..." 
                                        value={answers[q._id] || ""}
                                        onChange={e => handleAnswerChange(q._id, e.target.value)}
                                        required
                                    ></textarea>
                                </div>
                            )}
                        </div>
                    ))}

                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: "100%", padding: "1rem" }}>
                        {submitting ? "Submitting Attempt..." : "Finish and Submit Quiz"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default QuizSession;

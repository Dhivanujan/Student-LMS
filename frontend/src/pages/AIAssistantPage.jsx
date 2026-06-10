import { useState, useRef, useEffect } from "react";
import api from "../services/api";

const AIAssistantPage = () => {
    const [messages, setMessages] = useState([
        {
            sender: "ai",
            text: "Hello! I am your AI Academic Assistant. I can help you check your deadlines, summarize your enrolled courses, analyze your grades, or answer questions about your studies in Music, Dance, Drama, or Art. What can I do for you today?",
            suggestedPrompts: [
                "Check my upcoming deadlines",
                "Summarize my enrolled courses",
                "What is my current GPA/Grades?",
                "Give me study tips for Carnatic Music"
            ]
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (messageText) => {
        if (!messageText.trim()) return;

        // Add user message
        const userMsg = { sender: "user", text: messageText };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setLoading(true);

        try {
            const response = await api.post("/ai/chat", { message: messageText });
            const reply = response.data.data.reply;
            const suggested = response.data.data.suggestedPrompts || [];

            setMessages((prev) => [
                ...prev,
                { sender: "ai", text: reply, suggestedPrompts: suggested }
            ]);
        } catch (error) {
            console.error("AI Assistant Error:", error);
            setMessages((prev) => [
                ...prev,
                {
                    sender: "ai",
                    text: "I apologize, but I encountered an error communicating with my intelligence module. Please try again in a moment.",
                    suggestedPrompts: ["Retry latest check", "Summarize enrolled courses"]
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Helper function to render text with simple markdown (bold and bullets)
    const renderMessageContent = (text) => {
        const lines = text.split("\n");
        return lines.map((line, idx) => {
            let content = line;

            // Handle bullet points
            const isBullet = content.trim().startsWith("•") || content.trim().startsWith("*");
            if (isBullet) {
                // remove the bullet character
                content = content.replace(/^[•*]/, "").trim();
            }

            // Handle bold markdown (**text**)
            const parts = content.split("QA_SPACER"); // Dummy spacer first, let's use regex
            const regex = /\*\*(.*?)\*\*/g;
            const elements = [];
            let lastIndex = 0;
            let match;

            while ((match = regex.exec(content)) !== null) {
                // Text before match
                if (match.index > lastIndex) {
                    elements.push(content.substring(lastIndex, match.index));
                }
                // Bold text
                elements.push(<strong key={match.index}>{match[1]}</strong>);
                lastIndex = regex.lastIndex;
            }

            if (lastIndex < content.length) {
                elements.push(content.substring(lastIndex));
            }

            const parsedLine = elements.length > 0 ? elements : content;

            if (isBullet) {
                return (
                    <li key={idx} style={{ marginLeft: "1.2rem", marginBottom: "0.25rem", listStyleType: "disc" }}>
                        {parsedLine}
                    </li>
                );
            }

            return (
                <p key={idx} style={{ marginBottom: line.trim() === "" ? "0.75rem" : "0.35rem", minHeight: line.trim() === "" ? "0.5rem" : "auto" }}>
                    {parsedLine}
                </p>
            );
        });
    };

    return (
        <div className="animate-fade-in" style={{ height: "calc(100vh - 120px)", display: "flex", flexDirection: "column" }}>
            {/* Header info */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <div>
                    <h1 className="page-title" style={{ marginBottom: "0.25rem" }}>AI Academic Assistant</h1>
                    <p className="page-subtitle" style={{ margin: 0 }}>Instant guidance on schedules, tasks, grades, and course queries.</p>
                </div>
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1rem",
                    borderRadius: "20px",
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    color: "#10b981",
                    fontSize: "0.85rem",
                    fontWeight: "500"
                }}>
                    <span style={{
                        display: "inline-block",
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        boxShadow: "0 0 8px #10b981"
                    }}></span>
                    AI Model Active
                </div>
            </div>

            {/* Main Glassmorphic Chat Window */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                borderRadius: "20px",
                background: "rgba(30, 41, 59, 0.4)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.3)"
            }}>
                {/* Chat Message Box */}
                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.2rem"
                }}>
                    {messages.map((msg, index) => (
                        <div 
                            key={index} 
                            style={{ 
                                display: "flex", 
                                justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                                animation: "slideUp 0.3s ease forwards"
                            }}
                        >
                            <div style={{
                                maxWidth: "75%",
                                padding: "1rem 1.25rem",
                                borderRadius: msg.sender === "user" ? "18px 18px 2px 18px" : "18px 18px 18px 2px",
                                background: msg.sender === "user" 
                                    ? "linear-gradient(135deg, #6366f1, #4f46e5)" 
                                    : "rgba(255, 255, 255, 0.06)",
                                border: msg.sender === "user" 
                                    ? "1px solid rgba(99, 102, 241, 0.3)" 
                                    : "1px solid rgba(255, 255, 255, 0.08)",
                                color: msg.sender === "user" ? "#ffffff" : "#f1f5f9",
                                boxShadow: msg.sender === "user" 
                                    ? "0 4px 15px rgba(99, 102, 241, 0.2)" 
                                    : "none"
                            }}>
                                <div style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                                    {renderMessageContent(msg.text)}
                                </div>

                                {/* Suggested Prompts */}
                                {msg.sender === "ai" && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "0.5rem",
                                        marginTop: "1rem",
                                        paddingTop: "0.75rem",
                                        borderTop: "1px solid rgba(255, 255, 255, 0.06)"
                                    }}>
                                        {msg.suggestedPrompts.map((prompt, pIdx) => (
                                            <button
                                                key={pIdx}
                                                onClick={() => handleSend(prompt)}
                                                disabled={loading}
                                                style={{
                                                    background: "rgba(255, 255, 255, 0.06)",
                                                    border: "1px solid rgba(255, 255, 255, 0.1)",
                                                    borderRadius: "15px",
                                                    padding: "0.4rem 0.8rem",
                                                    color: "#818cf8",
                                                    fontSize: "0.8rem",
                                                    fontWeight: "500",
                                                    cursor: "pointer",
                                                    transition: "all 0.2s ease"
                                                }}
                                                onMouseOver={(e) => {
                                                    e.currentTarget.style.background = "rgba(129, 140, 248, 0.15)";
                                                    e.currentTarget.style.borderColor = "rgba(129, 140, 248, 0.3)";
                                                }}
                                                onMouseOut={(e) => {
                                                    e.currentTarget.style.background = "rgba(255, 255, 255, 0.06)";
                                                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                                                }}
                                            >
                                                {prompt}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {loading && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <div style={{
                                padding: "1rem 1.25rem",
                                borderRadius: "18px 18px 18px 2px",
                                background: "rgba(255, 255, 255, 0.06)",
                                border: "1px solid rgba(255, 255, 255, 0.08)",
                                color: "#f1f5f9",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem"
                            }}>
                                <span className="typing-dot" style={{ width: "6px", height: "6px", backgroundColor: "#818cf8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both" }}></span>
                                <span className="typing-dot" style={{ width: "6px", height: "6px", backgroundColor: "#818cf8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.2s" }}></span>
                                <span className="typing-dot" style={{ width: "6px", height: "6px", backgroundColor: "#818cf8", borderRadius: "50%", display: "inline-block", animation: "bounce 1.4s infinite ease-in-out both", animationDelay: "0.4s" }}></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Form Input Box */}
                <form 
                    onSubmit={(e) => {
                        e.preventDefault();
                        handleSend(input);
                    }}
                    style={{
                        padding: "1.25rem",
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        display: "flex",
                        gap: "0.75rem",
                        background: "rgba(15, 23, 42, 0.2)"
                    }}
                >
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask your academic assistant about assignments, courses, and schedules..."
                        disabled={loading}
                        style={{
                            flex: 1,
                            background: "rgba(255, 255, 255, 0.04)",
                            border: "1px solid rgba(255, 255, 255, 0.1)",
                            borderRadius: "14px",
                            padding: "0.9rem 1.2rem",
                            color: "#ffffff",
                            outline: "none",
                            fontSize: "0.95rem",
                            transition: "all 0.2s ease"
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "rgba(99, 102, 241, 0.5)";
                            e.currentTarget.style.boxShadow = "0 0 10px rgba(99, 102, 241, 0.15)";
                        }}
                        onBlur={(e) => {
                            e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                            e.currentTarget.style.boxShadow = "none";
                        }}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        style={{
                            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
                            border: "none",
                            borderRadius: "14px",
                            padding: "0 1.5rem",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
                            opacity: (loading || !input.trim()) ? 0.6 : 1,
                            pointerEvents: (loading || !input.trim()) ? "none" : "auto",
                            transition: "all 0.2s ease"
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)";
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.transform = "none";
                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(99, 102, 241, 0.3)";
                        }}
                    >
                        <span>Send</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
                            <line x1="22" y1="2" x2="11" y2="13"/>
                            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                        </svg>
                    </button>
                </form>
            </div>
            
            {/* Embedded styles for bouncing dots */}
            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1.0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AIAssistantPage;

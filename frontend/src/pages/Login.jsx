// ============================================
// LOGIN PAGE COMPONENT
// ============================================

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Simple validation check
        if (!email || !password) {
            setError("Please fill in all fields");
            return;
        }

        setSubmitting(true);
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="container flex-center" style={{ minHeight: "85vh" }}>
            <div className="glass-card form-container">
                <h2 className="text-center" style={{ marginBottom: "0.5rem", fontSize: "1.8rem" }}>
                    Welcome Back
                </h2>
                <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2.2rem" }}>
                    Sign in to manage your student courses
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input"
                            placeholder="john@school.edu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="btn btn-primary" 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {submitting ? "Signing in..." : "Login"}
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Don't have an account?{" "}
                    <Link to="/register" className="link-alt">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

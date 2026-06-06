// ============================================
// REGISTER PAGE COMPONENT
// ============================================

import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Register = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("student");
    
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Simple client-side validation check
        if (!name || !email || !password) {
            setError("All fields are required");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        setSubmitting(true);
        try {
            await register(name, email, password, role);
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
                    Create Account
                </h2>
                <p className="text-center" style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginBottom: "2rem" }}>
                    Join the EduManage platform today
                </p>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            className="form-input"
                            placeholder="John Doe"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

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
                        <label htmlFor="password">Password (min 6 characters)</label>
                        <input
                            type="password"
                            id="password"
                            className="form-input"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="role">Account Type</label>
                        <select
                            id="role"
                            className="form-input"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            style={{ background: "rgba(0,0,0,0.4)" }}
                        >
                            <option value="student" style={{ background: "var(--bg-dark)" }}>Student</option>
                            <option value="admin" style={{ background: "var(--bg-dark)" }}>Admin</option>
                        </select>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting} 
                        className="btn btn-primary" 
                        style={{ width: "100%", marginTop: "1rem" }}
                    >
                        {submitting ? "Registering Account..." : "Register"}
                    </button>
                </form>

                <p className="text-center" style={{ marginTop: "1.5rem", fontSize: "0.9rem", color: "var(--text-muted)" }}>
                    Already have an account?{" "}
                    <Link to="/login" className="link-alt">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

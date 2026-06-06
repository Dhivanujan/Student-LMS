// ============================================
// APP ENTRY COMPONENT - Routing & Core Structure
// ============================================

import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";

// Import Pages (which we will create next)
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Admin from "./pages/Admin";

/**
 * PROTECTED ROUTE GUARD
 * Intercepts routing for non-authenticated actions
 */
const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, loading } = useContext(AuthContext);

    // 1. Show message while verifying user session
    if (loading) {
        return (
            <div className="flex-center" style={{ minHeight: "80vh" }}>
                <div className="glass-card text-center">
                    <h2>Loading Session...</h2>
                    <p style={{ marginTop: "1rem" }}>Please wait while we secure your connection.</p>
                </div>
            </div>
        );
    }

    // 2. Redirect to Login if session doesn't exist
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // 3. Redirect back to Dashboard if role is unauthorized
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

const AppContent = () => {
    const { user } = useContext(AuthContext);

    return (
        <BrowserRouter>
            {/* Show navigation bar only if the user is authenticated */}
            {user && <Navbar />}
            
            <main>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/courses"
                        element={
                            <ProtectedRoute>
                                <Courses />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute allowedRoles={["admin"]}>
                                <Admin />
                            </ProtectedRoute>
                        }
                    />

                    {/* Default Fallback Redirect */}
                    <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
                </Routes>
            </main>
        </BrowserRouter>
    );
};

const App = () => {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
};

export default App;

// ============================================
// APP ENTRY COMPONENT - Routing & Core Structure
// ============================================

import { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import CursorGlow from "./components/CursorGlow";

// Import Pages
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseDetails from "./pages/CourseDetails";
import QuizSession from "./pages/QuizSession";
import Catalog from "./pages/Catalog";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import EventsPage from "./pages/EventsPage";
import TimetablePage from "./pages/TimetablePage";
import ExamsPage from "./pages/ExamsPage";
import AIAssistantPage from "./pages/AIAssistantPage";


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
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p className="loading-text">Securing your session...</p>
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
            <CursorGlow />
            {user && !user.firstLogin && <Navbar />}
            
            {user ? (
                user.firstLogin ? (
                    <main style={{ padding: "2rem 0", width: "100%", minHeight: "100vh" }}>
                        <Routes>
                            <Route path="/change-password" element={<ChangePassword />} />
                            <Route path="*" element={<Navigate to="/change-password" replace />} />
                        </Routes>
                    </main>
                ) : (
                    <div className="app-container" data-role={user?.role || ''}>
                        <Sidebar />
                        <main className="main-content">
                            <Routes>
                                {/* Authenticated Workspace Routes */}
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
                                    path="/courses/:id"
                                    element={
                                        <ProtectedRoute>
                                            <CourseDetails />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/courses/:courseId/quizzes/:quizId"
                                    element={
                                        <ProtectedRoute>
                                            <QuizSession />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/catalog"
                                    element={
                                        <ProtectedRoute allowedRoles={["student"]}>
                                            <Catalog />
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

                                <Route
                                    path="/events"
                                    element={
                                        <ProtectedRoute>
                                            <EventsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/timetables"
                                    element={
                                        <ProtectedRoute>
                                            <TimetablePage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/ai-assistant"
                                    element={
                                        <ProtectedRoute allowedRoles={["student"]}>
                                            <AIAssistantPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/exams"
                                    element={
                                        <ProtectedRoute>
                                            <ExamsPage />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/profile"
                                    element={
                                        <ProtectedRoute>
                                            <Profile />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/change-password"
                                    element={
                                        <ProtectedRoute>
                                            <ChangePassword />
                                        </ProtectedRoute>
                                    }
                                />

                                {/* Fallback Redirect */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </main>
                    </div>
                )
            ) : (
                <main>
                    <Routes>
                        {/* Public Auth Routes */}
                        <Route path="/login" element={<Login />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />

                        {/* Fallback Redirect to Login */}
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </main>
            )}
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

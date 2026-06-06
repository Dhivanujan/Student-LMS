import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";

// Create the context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Load authenticated user on app mount
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem("token");
            const storedUser = localStorage.getItem("user");

            if (token && storedUser) {
                try {
                    // Fetch fresh profile details from the unified /auth/me
                    const response = await api.get("/auth/me");
                    const userData = response.data.data;
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                } catch (error) {
                    console.error("Error verifying token or session expired:", error);
                    // Clear credentials if verification fails (e.g. 401 Unauthorized)
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    setUser(null);
                }
            } else {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                setUser(null);
            }
            setLoading(false);
        };

        initializeAuth();
    }, []);

    // 2. LOGIN action
    const login = async (email, password) => {
        try {
            const response = await api.post("/auth/login", { email, password });
            const { token, data } = response.data;

            // Store credentials in localStorage
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(data));

            // Set state
            setUser(data);
            return { success: true };
        } catch (error) {
            console.error("Login Context Error:", error);
            const message = error.response?.data?.message || "Login failed. Please try again.";
            throw new Error(message);
        }
    };

    // 3. REGISTER action
    const register = async (name, email, password, role = "student", departmentId = "") => {
        try {
            const payload = { name, email, password, role };
            if (departmentId) {
                payload.departmentId = departmentId;
            }
            const response = await api.post("/auth/register", payload);
            const { token, data } = response.data;

            // Auto-login after registration
            localStorage.setItem("token", token);
            localStorage.setItem("user", JSON.stringify(data));

            setUser(data);
            return { success: true };
        } catch (error) {
            console.error("Registration Context Error:", error);
            const errors = error.response?.data?.errors || [error.response?.data?.message || "Registration failed."];
            throw new Error(errors.join(", "));
        }
    };

    // 4. LOGOUT action
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    // 5. UPDATE PROFILE action
    const updateProfile = async (formData) => {
        try {
            const response = await api.put("/auth/profile", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });
            const userData = response.data.data;
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error("Update Profile Error:", error);
            const message = error.response?.data?.message || "Failed to update profile.";
            throw new Error(message);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

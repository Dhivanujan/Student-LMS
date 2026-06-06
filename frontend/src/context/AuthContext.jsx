/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect } from "react";
import api from "../services/api";

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
                    const response = await api.get("/auth/me");
                    const userData = response.data.data;
                    setUser(userData);
                    localStorage.setItem("user", JSON.stringify(userData));
                } catch (error) {
                    console.error("Error verifying token or session expired:", error);
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
            throw new Error(message, { cause: error });
        }
    };

    // 3. LOGOUT action
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    // 4. UPDATE PROFILE action
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
            throw new Error(message, { cause: error });
        }
    };

    // 5. CHANGE PASSWORD action
    const changePassword = async (currentPassword, newPassword) => {
        try {
            const response = await api.put("/auth/change-password", { currentPassword, newPassword });
            
            // If change is successful, update user.firstLogin = false locally
            const updatedUser = { ...user, firstLogin: false };
            setUser(updatedUser);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            
            return { success: true, message: response.data.message };
        } catch (error) {
            console.error("Change Password Error:", error);
            const message = error.response?.data?.message || "Failed to change password.";
            throw new Error(message, { cause: error });
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateProfile, changePassword }}>
            {children}
        </AuthContext.Provider>
    );
};

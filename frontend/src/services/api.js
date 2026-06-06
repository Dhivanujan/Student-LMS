// ============================================
// API CLIENT SERVICE - Axios Configuration
// ============================================

import axios from "axios";

// 1. Create a reusable Axios instance with a configured base URL
const api = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// 2. Add a Request Interceptor to automatically attach JWT token
api.interceptors.request.use(
    (config) => {
        // Retrieve token from local storage
        const token = localStorage.getItem("token");

        if (token) {
            // Attach authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Add a Response Interceptor to handle authentication failures (e.g. 401 Unauthorized)
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
            // Clear local storage credentials
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Redirect to login page or reload to reset app auth state
            // Only redirect if not already on the login or register page
            const currentPath = window.location.pathname;
            if (currentPath !== "/login" && currentPath !== "/register") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;

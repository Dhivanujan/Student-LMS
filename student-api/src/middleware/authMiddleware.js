// ============================================
// AUTH MIDDLEWARE - Protects routes and roles
// ============================================

const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * PROTECT MIDDLEWARE
 * Verifies that the user is authenticated via Bearer JWT token
 */
exports.protect = async (req, res, next) => {
    let token;

    // 1. Check if token exists in Authorization headers
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Split header 'Bearer token_string_here' to get token
            token = req.headers.authorization.split(" ")[1];

            // 2. Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Attach user to req.user (excluding password)
            req.user = await User.findById(decoded.id);
            
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "Not authorized to access this route (User not found)"
                });
            }

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Not authorized to access this route (Token failed)"
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided"
        });
    }
};

/**
 * AUTHORIZE ROLES MIDDLEWARE
 * Restricts access to specific roles (e.g., 'admin', 'lecturer')
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(500).json({
                success: false,
                message: "Authorization check failed (User not authenticated)"
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`
            });
        }

        next();
    };
};


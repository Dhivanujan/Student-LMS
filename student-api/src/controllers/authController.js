const User = require("../models/User");
const crypto = require("crypto");
const AuditLog = require("../models/AuditLog");

// Helper to log audit actions
const logAudit = async (action, details, performerId, ip) => {
    try {
        await AuditLog.create({ action, details, performerId, ipAddress: ip || "" });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

// ============================================
// REGISTER USER - DISABLED FOR PUBLIC ACCESS
// ============================================
exports.register = async (req, res) => {
    return res.status(403).json({
        success: false,
        message: "Public self-registration is disabled. Contact your administrator to obtain an account."
    });
};

// ============================================
// LOGIN USER
// ============================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email and password"
            });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Verify account active status
        if (!user.isActive) {
            await logAudit("SUSPENDED_LOGIN_ATTEMPT", `Attempted login on suspended account: ${email}`, user._id, req.ip);
            return res.status(403).json({
                success: false,
                message: "Your account is deactivated. Please contact the administrator."
            });
        }

        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            await logAudit("FAILED_LOGIN", `Failed login attempt for email: ${email}`, null, req.ip);
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        const token = user.getSignedJwtToken();

        await logAudit("USER_LOGIN", `Logged in: ${user.email}`, user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin,
                isActive: user.isActive,
                department: user.department,
                registrationNumber: user.registrationNumber,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Login failed",
            error: error.message
        });
    }
};

// ============================================
// GET CURRENT USER
// ============================================
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }
        res.status(200).json({
            success: true,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin,
                isActive: user.isActive,
                department: user.department,
                registrationNumber: user.registrationNumber,
                profilePicture: user.profilePicture,
                specialization: user.specialization
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get user profile",
            error: error.message
        });
    }
};

// ============================================
// CHANGE PASSWORD (First Login / Normal update)
// ============================================
exports.changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // For first login, currentPassword might not be strictly checked depending on design,
        // but it is safer to check if password matches current (unless they are changing it without it).
        // Let's support checking current password if it is passed, or just change it if they are logged in.
        // Actually, verifying the currentPassword is best practice.
        if (currentPassword) {
            const isMatch = await user.matchPassword(currentPassword);
            if (!isMatch) {
                return res.status(400).json({
                    success: false,
                    message: "Current password is incorrect"
                });
            }
        }

        // Validate password complexity
        // Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        user.password = newPassword;
        user.firstLogin = false; // Set to false after successful change
        await user.save();

        await logAudit("USER_CHANGE_PASSWORD", `Password changed for user: ${user.email}`, user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "Password changed successfully! You now have full access to the LMS."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to change password",
            error: error.message
        });
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
exports.updateProfile = async (req, res) => {
    try {
        const { name, specialization } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (specialization && user.role === "lecturer") user.specialization = specialization;

        if (req.file) {
            user.profilePicture = `/uploads/${req.file.filename}`;
        }

        await user.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin,
                isActive: user.isActive,
                department: user.department,
                registrationNumber: user.registrationNumber,
                profilePicture: user.profilePicture,
                specialization: user.specialization
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update profile",
            error: error.message
        });
    }
};

// ============================================
// FORGOT PASSWORD
// ============================================
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No user registered with this email"
            });
        }

        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken,
            resetUrl,
            warning: "Demo Mode: The reset url has been returned directly. In production, this would be emailed."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Forgot password request failed",
            error: error.message
        });
    }
};

// ============================================
// RESET PASSWORD
// ============================================
exports.resetPassword = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired reset token"
            });
        }

        // Validate password complexity
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
        if (!passwordRegex.test(req.body.password)) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
            });
        }

        user.password = req.body.password;
        user.firstLogin = false; // If password is explicitly reset by reset link, mark firstLogin = false
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: "Password reset successful! You can now log in."
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Password reset failed",
            error: error.message
        });
    }
};

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
// REGISTER USER
// ============================================
exports.register = async (req, res) => {
    try {
        const { name, email, password, role, departmentId, specialization } = req.body;

        // 1. Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "User already registered with this email"
            });
        }

        // Generate student or lecturer ID if role is specified
        let studentId = "";
        let lecturerId = "";
        if (role === "student") {
            studentId = "STU-" + Math.floor(100000 + Math.random() * 900000);
        } else if (role === "lecturer") {
            lecturerId = "LEC-" + Math.floor(100000 + Math.random() * 900000);
        }

        // 2. Create user
        const user = await User.create({
            name,
            email,
            password,
            role: role || "student",
            departmentId: departmentId || null,
            studentId,
            lecturerId,
            specialization: specialization || ""
        });

        // 3. Generate Token
        const token = user.getSignedJwtToken();

        await logAudit("USER_REGISTER", `Registered new account: ${user.email} with role: ${user.role}`, user._id, req.ip);

        res.status(201).json({
            success: true,
            message: "User registered successfully!",
            token,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                lecturerId: user.lecturerId,
                profilePicture: user.profilePicture
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Registration failed",
            error: error.message
        });
    }
};

// ============================================
// LOGIN USER
// ============================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Validate inputs
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email and password"
            });
        }

        // 2. Find user
        const user = await User.findOne({ email }).select("+password").populate("departmentId", "name code");
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 3. Check password
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            await logAudit("FAILED_LOGIN", `Failed login attempt for email: ${email}`, null, req.ip);
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 4. Token
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
                studentId: user.studentId,
                lecturerId: user.lecturerId,
                profilePicture: user.profilePicture,
                department: user.departmentId
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
        const user = await User.findById(req.user.id).populate("departmentId", "name code");
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
                studentId: user.studentId,
                lecturerId: user.lecturerId,
                profilePicture: user.profilePicture,
                department: user.departmentId,
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

        // If file uploaded
        if (req.file) {
            // Local upload path
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
                studentId: user.studentId,
                lecturerId: user.lecturerId,
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

        // Generate reset token
        const resetToken = user.getResetPasswordToken();
        await user.save({ validateBeforeSave: false });

        // Since it's a demo, we return the token in response to allow easy mock testing
        // In production, we'd send an email with this URL:
        const resetUrl = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

        res.status(200).json({
            success: true,
            message: "Password reset token generated",
            resetToken, // for testing / direct usage
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

        // Set new password
        user.password = req.body.password;
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

const User = require("../models/User");
const AuditLog = require("../models/AuditLog");
const Student = require("../models/Student");
const Lecturer = require("../models/Lecturer");
const Department = require("../models/Department");

// Helper to log audit actions
const logAudit = async (action, details, performerId, ip) => {
    try {
        await AuditLog.create({ action, details, performerId, ipAddress: ip || "" });
    } catch (err) {
        console.error("Audit log failed:", err.message);
    }
};

// Helper to sync user profile with sub-collections Student/Lecturer
const syncUserProfile = async (user, spec) => {
    try {
        let departmentId = null;
        if (user.department) {
            const dept = await Department.findOne({ name: user.department });
            if (dept) {
                departmentId = dept._id;
            }
        }

        if (user.role === "student") {
            let student = await Student.findOne({ userId: user._id });
            if (!student) {
                await Student.create({
                    userId: user._id,
                    departmentId,
                    registrationNumber: user.registrationNumber,
                    academicYear: "1st Year",
                    semester: 1,
                    gpa: 0.0
                });
            } else {
                student.departmentId = departmentId;
                student.registrationNumber = user.registrationNumber;
                await student.save();
            }
            await Lecturer.findOneAndDelete({ userId: user._id });
        } else if (user.role === "lecturer") {
            let lecturer = await Lecturer.findOne({ userId: user._id });
            if (!lecturer) {
                await Lecturer.create({
                    userId: user._id,
                    departmentId,
                    employeeId: user.registrationNumber,
                    specialization: spec || user.specialization || "",
                    qualifications: [],
                    biography: ""
                });
            } else {
                lecturer.departmentId = departmentId;
                lecturer.employeeId = user.registrationNumber;
                if (spec !== undefined) lecturer.specialization = spec;
                await lecturer.save();
            }
            await Student.findOneAndDelete({ userId: user._id });
        } else {
            await Student.findOneAndDelete({ userId: user._id });
            await Lecturer.findOneAndDelete({ userId: user._id });
        }
    } catch (err) {
        console.error("Failed to sync sub-profile:", err.message);
    }
};

// ============================================
// GET ALL USERS (Filtered by role)
// ============================================
exports.getUsers = async (req, res) => {
    try {
        const { role, department, search } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }
        if (department) {
            query.department = { $regex: department, $options: "i" };
        }
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
                { registrationNumber: { $regex: search, $options: "i" } }
            ];
        }

        const users = await User.find(query).select("-password");

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch users",
            error: error.message
        });
    }
};

// ============================================
// CREATE USER (Admin only)
// ============================================
exports.createUser = async (req, res) => {
    try {
        const { name, email, role, department, registrationNumber, specialization } = req.body;

        if (!name || !email || !registrationNumber || !role) {
            return res.status(400).json({
                success: false,
                message: "Please fill in name, email, registrationNumber, and role"
            });
        }

        // 1. Check if user already exists
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use"
            });
        }

        const regExists = await User.findOne({ registrationNumber });
        if (regExists) {
            return res.status(400).json({
                success: false,
                message: "Registration or Employee ID is already in use"
            });
        }

        // 2. Generate a temporary password (meets complexity checks: e.g. Temp@123456)
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const temporaryPassword = `Temp@${randomNum}`;

        // 3. Create user
        const user = await User.create({
            name,
            email,
            password: temporaryPassword, // Hashed in pre-save hook
            role,
            department: department || "",
            registrationNumber,
            firstLogin: true, // Force change password on first login
            isActive: true,
            specialization: specialization || ""
        });

        // Sync profile to sub-collections
        await syncUserProfile(user, specialization);

        await logAudit("ADMIN_CREATE_USER", `Admin created user: ${user.email} (${user.role})`, req.user._id, req.ip);

        res.status(201).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} account created successfully!`,
            temporaryPassword, // Shared with Admin to pass manually
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                firstLogin: user.firstLogin,
                isActive: user.isActive,
                department: user.department,
                registrationNumber: user.registrationNumber
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create user",
            error: error.message
        });
    }
};

// ============================================
// UPDATE USER (Admin only)
// ============================================
exports.updateUser = async (req, res) => {
    try {
        const { name, email, department, registrationNumber, specialization, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (department !== undefined) user.department = department;
        if (registrationNumber) user.registrationNumber = registrationNumber;
        if (specialization !== undefined) user.specialization = specialization;
        if (role) user.role = role;

        await user.save();

        // Sync profile to sub-collections
        await syncUserProfile(user, specialization);

        await logAudit("ADMIN_UPDATE_USER", `Admin updated user details: ${user.email}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "User account updated successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update user",
            error: error.message
        });
    }
};

// ============================================
// RESET USER PASSWORD (Admin only)
// ============================================
exports.resetUserPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Generate new temporary password
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        const temporaryPassword = `Reset@${randomNum}`;

        user.password = temporaryPassword;
        user.firstLogin = true; // Mark firstLogin back to true, forcing change
        await user.save();

        await logAudit("ADMIN_RESET_PASSWORD", `Admin reset password for user: ${user.email}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "Password reset completed! Share the new temporary password.",
            temporaryPassword
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to reset password",
            error: error.message
        });
    }
};

// ============================================
// TOGGLE USER ACTIVE STATUS (Admin only)
// ============================================
exports.toggleUserStatus = async (req, res) => {
    try {
        const { isActive } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        user.isActive = isActive;
        await user.save();

        await logAudit(
            user.isActive ? "ADMIN_ACTIVATE_USER" : "ADMIN_SUSPEND_USER",
            `Admin ${user.isActive ? "activated" : "deactivated"} user: ${user.email}`,
            req.user._id,
            req.ip
        );

        res.status(200).json({
            success: true,
            message: `User account has been ${user.isActive ? "activated" : "deactivated"}!`,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to toggle user status",
            error: error.message
        });
    }
};

// ============================================
// DELETE USER (Admin only)
// ============================================
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        await User.findByIdAndDelete(req.params.id);
        await Student.findOneAndDelete({ userId: user._id });
        await Lecturer.findOneAndDelete({ userId: user._id });

        await logAudit("ADMIN_DELETE_USER", `Admin deleted user: ${user.email}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: error.message
        });
    }
};

// ============================================
// GET SYSTEM AUDIT LOGS (Admin only)
// ============================================
exports.getAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate("performerId", "name email role")
            .sort("-createdAt")
            .limit(100);

        res.status(200).json({
            success: true,
            data: logs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch audit logs",
            error: error.message
        });
    }
};

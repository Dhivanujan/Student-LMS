const User = require("../models/User");
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
// GET ALL USERS (Filtered by role)
// ============================================
exports.getUsers = async (req, res) => {
    try {
        const { role, departmentId, search } = req.query;
        let query = {};

        if (role) {
            query.role = role;
        }
        if (departmentId) {
            query.departmentId = departmentId;
        }
        if (search) {
            query.name = { $regex: search, $options: "i" };
        }

        const users = await User.find(query)
            .populate("departmentId", "name code")
            .select("-password");

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
        const { name, email, password, role, departmentId, specialization } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Email is already in use"
            });
        }

        let studentId = "";
        let lecturerId = "";
        if (role === "student") {
            studentId = "STU-" + Math.floor(100000 + Math.random() * 900000);
        } else if (role === "lecturer") {
            lecturerId = "LEC-" + Math.floor(100000 + Math.random() * 900000);
        }

        const user = await User.create({
            name,
            email,
            password,
            role,
            departmentId: departmentId || null,
            studentId,
            lecturerId,
            specialization: specialization || ""
        });

        await logAudit("ADMIN_CREATE_USER", `Admin created user: ${user.email} with role: ${user.role}`, req.user._id, req.ip);

        res.status(201).json({
            success: true,
            message: `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully!`,
            data: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                studentId: user.studentId,
                lecturerId: user.lecturerId
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
        const { name, email, departmentId, specialization, role } = req.body;
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (departmentId !== undefined) user.departmentId = departmentId || null;
        if (specialization !== undefined) user.specialization = specialization;
        if (role) user.role = role;

        await user.save();

        await logAudit("ADMIN_UPDATE_USER", `Admin updated user: ${user.email}`, req.user._id, req.ip);

        res.status(200).json({
            success: true,
            message: "User updated successfully",
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

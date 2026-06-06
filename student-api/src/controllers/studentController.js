// ============================================
// STUDENT CONTROLLER - Business logic handlers
// ============================================

const Student = require("../models/Student");

// ============================================
// GET CURRENT LOGGED-IN STUDENT
// ============================================
exports.getCurrentStudent = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to get student profile",
            error: error.message
        });
    }
};

exports.registerStudent = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // 1. Check if user already exists
        const userExists = await Student.findOne({ email });

        if (userExists) {
            return res.status(400).json({
                success: false,
                message: "Student already registered with this email"
            });
        }

        // 2. Create student in database
        const student = await Student.create({
            name,
            email,
            password,
            role
        });

        // 3. Generate JWT Token
        const token = student.getSignedJwtToken();

        // 4. Send success response
        res.status(201).json({
            success: true,
            message: "Registration successful!",
            token,
            data: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
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
// LOGIN STUDENT
// ============================================

exports.loginStudent = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please provide an email and password"
            });
        }

        // 2. Find student by email and explicitly include password
        const student = await Student.findOne({ email }).select("+password");

        if (!student) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 3. Check if password matches
        const isMatch = await student.matchPassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // 4. Generate JWT Token
        const token = student.getSignedJwtToken();

        // 5. Send success response
        res.status(200).json({
            success: true,
            message: "Login successful!",
            token,
            data: {
                id: student._id,
                name: student.name,
                email: student.email,
                role: student.role
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
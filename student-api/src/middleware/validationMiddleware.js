// ============================================
// VALIDATION MIDDLEWARE - Input checking
// ============================================

/**
 * VALIDATE REGISTER INPUT
 */
exports.validateRegister = (req, res, next) => {
    const { name, email, password } = req.body;
    const errors = [];

    if (!name || name.trim() === "") {
        errors.push("Name is required");
    }

    if (!email || email.trim() === "") {
        errors.push("Email is required");
    } else {
        const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            errors.push("Please provide a valid email address");
        }
    }

    if (!password || password.length < 6) {
        errors.push("Password must be at least 6 characters long");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

/**
 * VALIDATE LOGIN INPUT
 */
exports.validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    const errors = [];

    if (!email || email.trim() === "") {
        errors.push("Email is required");
    }
    
    if (!password || password.trim() === "") {
        errors.push("Password is required");
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

/**
 * VALIDATE COURSE INPUT
 */
exports.validateCourse = (req, res, next) => {
    const { title, description, instructor, duration, capacity } = req.body;
    const errors = [];

    if (!title || title.trim() === "") {
        errors.push("Course title is required");
    }

    if (!description || description.trim() === "") {
        errors.push("Course description is required");
    }

    if (!instructor || instructor.trim() === "") {
        errors.push("Course instructor is required");
    }

    if (!duration || duration.trim() === "") {
        errors.push("Course duration is required");
    }

    if (capacity !== undefined) {
        const parsedCapacity = parseInt(capacity, 10);
        if (isNaN(parsedCapacity) || parsedCapacity <= 0) {
            errors.push("Course capacity must be a positive number");
        }
    }

    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            errors
        });
    }

    next();
};

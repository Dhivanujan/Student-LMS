// ============================================
// ERROR MIDDLEWARE - Global handler for API errors
// ============================================

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    error.message = err.message;

    // Log to console for developers
    console.error("🔥 Global Error Handler Caught Error:\n", err);

    // 1. Mongoose Bad ObjectId (CastError)
    if (err.name === "CastError") {
        const message = `Resource not found with id of ${err.value}`;
        return res.status(404).json({
            success: false,
            message
        });
    }

    // 2. Mongoose Duplicate Key (code 11000)
    if (err.code === 11000) {
        const message = "Duplicate field value entered. Resource already exists.";
        return res.status(400).json({
            success: false,
            message
        });
    }

    // 3. Mongoose Validation Error
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
            success: false,
            message
        });
    }

    // 4. Default Fallback Error Response
    res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || "Server Error"
    });
};

module.exports = errorHandler;

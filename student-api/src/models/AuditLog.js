const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    performerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null // Null for anonymous actions (e.g. failed login attempts)
    },
    ipAddress: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);

const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a department name"],
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: [true, "Please add a department code"],
        unique: true,
        trim: true,
        uppercase: true
    },
    facultyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Faculty",
        required: [true, "Department must belong to a faculty"]
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Department", departmentSchema);

const Faculty = require("../models/Faculty");
const Department = require("../models/Department");

// ============================================
// FACULTY CRUD
// ============================================

exports.getFaculties = async (req, res) => {
    try {
        const faculties = await Faculty.find();
        res.status(200).json({ success: true, data: faculties });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createFaculty = async (req, res) => {
    try {
        const { name, description } = req.body;
        const faculty = await Faculty.create({ name, description });
        res.status(201).json({ success: true, data: faculty });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteFaculty = async (req, res) => {
    try {
        const deptsExist = await Department.findOne({ facultyId: req.params.id });
        if (deptsExist) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete faculty. It has active departments associated with it."
            });
        }
        await Faculty.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Faculty deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

// ============================================
// DEPARTMENT CRUD
// ============================================

exports.getDepartments = async (req, res) => {
    try {
        const depts = await Department.find().populate("facultyId", "name");
        res.status(200).json({ success: true, data: depts });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.createDepartment = async (req, res) => {
    try {
        const { name, code, facultyId } = req.body;
        const dept = await Department.create({ name, code, facultyId });
        res.status(201).json({ success: true, data: dept });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

exports.deleteDepartment = async (req, res) => {
    try {
        await Department.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Department deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
};

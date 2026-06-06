const express = require("express");
const router = express.Router();
const { getUsers, createUser, updateUser, deleteUser, getAuditLogs, resetUserPassword, toggleUserStatus } = require("../controllers/userController");
const { getFaculties, createFaculty, deleteFaculty, getDepartments, createDepartment, deleteDepartment } = require("../controllers/facultyController");
const { protect, authorize } = require("../middleware/authMiddleware");

// All these routes require Admin role
router.use(protect, authorize("admin"));

// User management
router.route("/")
    .get(getUsers)
    .post(createUser);

router.route("/:id")
    .put(updateUser)
    .delete(deleteUser);

router.put("/:id/reset-password", resetUserPassword);
router.put("/:id/toggle-status", toggleUserStatus);

// Audit logs
router.get("/audit-logs", getAuditLogs);

// Faculty & Department management
router.route("/faculties")
    .get(getFaculties)
    .post(createFaculty);

router.delete("/faculties/:id", deleteFaculty);

router.route("/departments")
    .get(getDepartments)
    .post(createDepartment);

router.delete("/departments/:id", deleteDepartment);

module.exports = router;

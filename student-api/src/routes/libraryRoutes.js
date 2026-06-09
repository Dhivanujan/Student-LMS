const express = require("express");
const router = express.Router();
const {
    getBooks,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/libraryController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.use(protect);

router.route("/")
    .get(getBooks)
    .post(authorize("admin", "hod", "lecturer"), upload.single("file"), createBook);

router.route("/:id")
    .put(authorize("admin", "hod", "lecturer"), upload.single("file"), updateBook)
    .delete(authorize("admin", "hod", "lecturer"), deleteBook);

module.exports = router;

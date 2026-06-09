const express = require("express");
const router = express.Router();
const {
    getAllPortfolios,
    getMyPortfolio,
    getStudentPortfolio,
    updatePortfolio,
    addPortfolioItem,
    deletePortfolioItem
} = require("../controllers/portfolioController");

const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Allow public to search portfolios, but authenticate for detail editing/upload
router.get("/", getAllPortfolios);
router.get("/student/:studentId", getStudentPortfolio);

// Secure routes
router.use(protect);

router.get("/me", getMyPortfolio);
router.put("/me", upload.single("featuredImage"), updatePortfolio);
router.post("/items", upload.single("file"), addPortfolioItem);
router.delete("/items/:itemId", deletePortfolioItem);

module.exports = router;

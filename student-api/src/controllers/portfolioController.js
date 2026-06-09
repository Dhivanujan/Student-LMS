const Portfolio = require("../models/Portfolio");
const PortfolioItem = require("../models/PortfolioItem");
const User = require("../models/User");

// ============================================
// GET ALL PORTFOLIOS (Public Gallery Showcase)
// ============================================
exports.getAllPortfolios = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (search) {
            // Find users matching search name
            const matchingUsers = await User.find({
                name: { $regex: search, $options: "i" }
            });
            const userIds = matchingUsers.map(u => u._id);
            query.studentId = { $in: userIds };
        }

        const portfolios = await Portfolio.find(query)
            .populate("studentId", "name email registrationNumber profilePicture department")
            .sort("-createdAt");

        res.status(200).json({ success: true, count: portfolios.length, data: portfolios });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET PERSONAL PORTFOLIO (Student only)
// ============================================
exports.getMyPortfolio = async (req, res) => {
    try {
        let portfolio = await Portfolio.findOne({ studentId: req.user.id })
            .populate("studentId", "name email registrationNumber profilePicture department");

        if (!portfolio) {
            // Automatically initialize a blank portfolio for the student if it doesn't exist
            portfolio = await Portfolio.create({
                studentId: req.user.id,
                bio: `Hello! I am a student in the ${req.user.department || "Aesthetic Studies"} department.`,
                category: req.user.department && ["Music", "Dance", "Drama & Theatre", "Visual & Technological Arts"].includes(req.user.department)
                    ? req.user.department
                    : "Music",
                skills: []
            });
            portfolio = await portfolio.populate("studentId", "name email registrationNumber profilePicture department");
        }

        const items = await PortfolioItem.find({ portfolioId: portfolio._id }).sort("-createdAt");

        res.status(200).json({ success: true, data: { portfolio, items } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// GET SPECIFIC STUDENT PORTFOLIO (Public view)
// ============================================
exports.getStudentPortfolio = async (req, res) => {
    try {
        const { studentId } = req.params;
        const portfolio = await Portfolio.findOne({ studentId })
            .populate("studentId", "name email registrationNumber profilePicture department");

        if (!portfolio) {
            return res.status(404).json({ success: false, message: "Portfolio not found for this student" });
        }

        const items = await PortfolioItem.find({ portfolioId: portfolio._id }).sort("-createdAt");

        res.status(200).json({ success: true, data: { portfolio, items } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE PORTFOLIO DETAILS (Student only)
// ============================================
exports.updatePortfolio = async (req, res) => {
    try {
        const { bio, skills, category } = req.body;
        let updateData = {};

        if (bio !== undefined) updateData.bio = bio;
        if (skills !== undefined) {
            updateData.skills = Array.isArray(skills) ? skills : skills.split(",").map(s => s.trim()).filter(Boolean);
        }
        if (category) updateData.category = category;

        if (req.file) {
            updateData.featuredImage = `/uploads/${req.file.filename}`;
        }

        const portfolio = await Portfolio.findOneAndUpdate(
            { studentId: req.user.id },
            updateData,
            { new: true, upsert: true }
        ).populate("studentId", "name email registrationNumber profilePicture department");

        res.status(200).json({ success: true, message: "Portfolio updated successfully!", data: portfolio });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// ADD ITEM TO PORTFOLIO (Student only)
// ============================================
exports.addPortfolioItem = async (req, res) => {
    try {
        const { title, description, category, type } = req.body;
        
        let portfolio = await Portfolio.findOne({ studentId: req.user.id });
        if (!portfolio) {
            // Create portfolio if missing
            portfolio = await Portfolio.create({
                studentId: req.user.id,
                bio: "",
                category: req.user.department && ["Music", "Dance", "Drama & Theatre", "Visual & Technological Arts"].includes(req.user.department)
                    ? req.user.department
                    : "Music",
                skills: []
            });
        }

        let fileUrl = "";
        let itemType = type;

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
            // Auto detect type from mimetype
            const mimetype = req.file.mimetype;
            if (mimetype.startsWith("image/")) itemType = "image";
            else if (mimetype.startsWith("audio/")) itemType = "audio";
            else if (mimetype.startsWith("video/")) itemType = "video";
            else itemType = "document";
        } else if (req.body.fileUrl) {
            fileUrl = req.body.fileUrl; // In case external URL (Youtube/Soundcloud) is pasted
        }

        if (!fileUrl) {
            return res.status(400).json({ success: false, message: "Please upload a media file or provide a external media URL" });
        }

        const portfolioItem = await PortfolioItem.create({
            portfolioId: portfolio._id,
            title,
            description,
            type: itemType || "document",
            fileUrl,
            category: category || "General"
        });

        res.status(201).json({ success: true, message: "Portfolio item added successfully!", data: portfolioItem });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE PORTFOLIO ITEM (Student only)
// ============================================
exports.deletePortfolioItem = async (req, res) => {
    try {
        const { itemId } = req.params;
        const item = await PortfolioItem.findById(itemId).populate("portfolioId");

        if (!item) {
            return res.status(404).json({ success: false, message: "Portfolio item not found" });
        }

        // Authorize: check if portfolio belongs to logged in user
        if (item.portfolioId.studentId.toString() !== req.user.id) {
            return res.status(403).json({ success: false, message: "Not authorized to delete this item" });
        }

        await PortfolioItem.deleteOne({ _id: itemId });

        res.status(200).json({ success: true, message: "Portfolio item removed successfully!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

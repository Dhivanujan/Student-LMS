const LibraryBook = require("../models/LibraryBook");

// ============================================
// GET ALL BOOKS & SEARCH
// ============================================
exports.getBooks = async (req, res) => {
    try {
        const { search, category, type } = req.query;
        let query = {};

        if (category) {
            query.category = category;
        }

        if (type) {
            query.type = type;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { author: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const books = await LibraryBook.find(query).sort("-createdAt");
        res.status(200).json({ success: true, count: books.length, data: books });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// CREATE BOOK/MATERIAL (Lecturer / HOD / Admin)
// ============================================
exports.createBook = async (req, res) => {
    try {
        const { title, author, category, type, isbn, publishedYear, description } = req.body;
        let fileUrl = "";

        if (req.file) {
            fileUrl = `/uploads/${req.file.filename}`;
        } else if (req.body.fileUrl) {
            fileUrl = req.body.fileUrl;
        }

        const book = await LibraryBook.create({
            title,
            author,
            category,
            type,
            fileUrl,
            isbn,
            publishedYear,
            description
        });

        res.status(201).json({ success: true, message: "Resource added to Digital Library!", data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// UPDATE BOOK/MATERIAL (Lecturer / HOD / Admin)
// ============================================
exports.updateBook = async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = { ...req.body };

        if (req.file) {
            updateFields.fileUrl = `/uploads/${req.file.filename}`;
        }

        const book = await LibraryBook.findByIdAndUpdate(id, updateFields, { new: true });
        if (!book) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }

        res.status(200).json({ success: true, message: "Resource updated successfully!", data: book });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// ============================================
// DELETE BOOK/MATERIAL (Lecturer / HOD / Admin)
// ============================================
exports.deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const book = await LibraryBook.findById(id);
        if (!book) {
            return res.status(404).json({ success: false, message: "Resource not found" });
        }

        await LibraryBook.deleteOne({ _id: id });
        res.status(200).json({ success: true, message: "Resource deleted from Digital Library!" });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

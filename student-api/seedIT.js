// ==========================================================================
// SEED SOFTWARE & IT FIELD DATABASE RECORDS
// Run this script using: node seedIT.js
// ==========================================================================

require("dotenv").config();
const mongoose = require("mongoose");

// Import models
const Faculty = require("./src/models/Faculty");
const Department = require("./src/models/Department");
const User = require("./src/models/User");
const Course = require("./src/models/Course");
const Enrollment = require("./src/models/Enrollment");
const Assignment = require("./src/models/Assignment");
const Quiz = require("./src/models/Quiz");
const Question = require("./src/models/Question");
const Announcement = require("./src/models/Announcement");
const ForumThread = require("./src/models/ForumThread");
const ForumComment = require("./src/models/ForumComment");

const seedDatabase = async () => {
    try {
        console.log("🍃 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected successfully!\n");

        // ==========================================
        // 1. CLEANUP EXISTING RECORDS
        // ==========================================
        console.log("🧹 Cleaning up old IT/Software seed data...");

        // Find existing faculty to cascade deletes if needed
        const existingFaculty = await Faculty.findOne({ name: "Faculty of Computer Science & IT" });
        if (existingFaculty) {
            const departments = await Department.find({ facultyId: existingFaculty._id });
            const departmentIds = departments.map(d => d._id);

            // Delete courses under these departments
            const courses = await Course.find({ departmentId: { $in: departmentIds } });
            const courseIds = courses.map(c => c._id);

            // Delete assignments, quizzes, forum threads, announcements for these courses
            await Assignment.deleteMany({ courseId: { $in: courseIds } });
            const quizzes = await Quiz.find({ courseId: { $in: courseIds } });
            const quizIds = quizzes.map(q => q._id);
            await Question.deleteMany({ quizId: { $in: quizIds } });
            await Quiz.deleteMany({ courseId: { $in: courseIds } });
            await Announcement.deleteMany({ scope: "course", targetId: { $in: courseIds } });
            
            const threads = await ForumThread.find({ courseId: { $in: courseIds } });
            const threadIds = threads.map(t => t._id);
            await ForumComment.deleteMany({ threadId: { $in: threadIds } });
            await ForumThread.deleteMany({ courseId: { $in: courseIds } });
            await Enrollment.deleteMany({ courseId: { $in: courseIds } });

            await Course.deleteMany({ departmentId: { $in: departmentIds } });
            await Department.deleteMany({ facultyId: existingFaculty._id });
            await Faculty.deleteOne({ _id: existingFaculty._id });
        }

        // Clean up specific seeded users by registration number or email
        const seededRegNums = [
            "L-CS-001", "L-CS-002", "L-SE-001",
            "S-CS-001", "S-CS-002", "S-SE-001"
        ];
        await User.deleteMany({ registrationNumber: { $in: seededRegNums } });

        // Drop indexes on Course collection to remove obsolete indexes (like title_1)
        try {
            await Course.collection.dropIndexes();
            console.log("🧬 Dropped obsolete indexes on courses collection.");
        } catch (err) {
            // Index dropping might fail if collection doesn't exist yet, which is fine
        }

        console.log("🗑️ Cleanup completed.\n");

        // ==========================================
        // 2. CREATE FACULTY & DEPARTMENTS
        // ==========================================
        console.log("🏫 Seeding Faculty & Departments...");
        
        const csFaculty = await Faculty.create({
            name: "Faculty of Computer Science & IT",
            description: "Dedicated to research and education in theoretical computer science, software engineering, systems, and practical information technology."
        });

        const cseDept = await Department.create({
            name: "Computer Science & Engineering",
            code: "CSE",
            facultyId: csFaculty._id
        });

        const seDept = await Department.create({
            name: "Software Engineering",
            code: "SE",
            facultyId: csFaculty._id
        });

        const itDept = await Department.create({
            name: "Information Technology",
            code: "IT",
            facultyId: csFaculty._id
        });

        console.log(`✅ Seeded Faculty: ${csFaculty.name}`);
        console.log(`✅ Seeded Departments: CSE, SE, IT`);

        // ==========================================
        // 3. CREATE LECTURERS & STUDENTS
        // ==========================================
        console.log("\n👥 Seeding Users (Lecturers & Students)...");

        // Seed Lecturers (with firstLogin: false to make them active immediately without password changes in demo)
        const turing = await User.create({
            name: "Dr. Alan Turing",
            email: "alan.turing@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Computer Science & Engineering",
            registrationNumber: "L-CS-001",
            specialization: "Theory of Computation & Algorithms"
        });

        const hopper = await User.create({
            name: "Prof. Grace Hopper",
            email: "grace.hopper@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Computer Science & Engineering",
            registrationNumber: "L-CS-002",
            specialization: "Compilers & Systems Architectures"
        });

        const lovelace = await User.create({
            name: "Ada Lovelace",
            email: "ada.lovelace@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Software Engineering",
            registrationNumber: "L-SE-001",
            specialization: "Software Design Patterns & Analysis"
        });

        // Seed Students
        const linus = await User.create({
            name: "Linus Torvalds",
            email: "linus@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Computer Science & Engineering",
            registrationNumber: "S-CS-001"
        });

        const woz = await User.create({
            name: "Steve Wozniak",
            email: "woz@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Computer Science & Engineering",
            registrationNumber: "S-CS-002"
        });

        const hamilton = await User.create({
            name: "Margaret Hamilton",
            email: "margaret@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Software Engineering",
            registrationNumber: "S-SE-001"
        });

        console.log(`✅ Seeded 3 Lecturers: Dr. Alan Turing, Prof. Grace Hopper, Ada Lovelace`);
        console.log(`✅ Seeded 3 Students: Linus Torvalds, Steve Wozniak, Margaret Hamilton`);
        console.log(`🔑 Defaults: emails above, password for lecturers: 'Lecturer@123', students: 'Student@123'`);

        // ==========================================
        // 4. CREATE COURSES
        // ==========================================
        console.log("\n📘 Seeding Courses & Lecture Materials...");

        const cse201 = await Course.create({
            code: "CSE201",
            name: "Data Structures & Algorithms",
            description: "Analysis of algorithms, time and space complexity, arrays, linked lists, stacks, queues, trees, graphs, sorting, and searching methods.",
            credits: 4,
            semester: "Fall 2026",
            departmentId: cseDept._id,
            lecturerId: turing._id,
            materials: [
                {
                    title: "Lecture 1: Introduction to Big-O Notation",
                    fileUrl: "https://example.com/materials/cse201/lecture1.pdf",
                    fileType: "pdf"
                },
                {
                    title: "Lecture 2: Binary Search Trees & AVL Trees",
                    fileUrl: "https://example.com/materials/cse201/lecture2.pdf",
                    fileType: "pdf"
                }
            ]
        });

        const cse401 = await Course.create({
            code: "CSE401",
            name: "Introduction to Machine Learning",
            description: "Supervised and unsupervised learning techniques, linear regression, decision trees, support vector machines, neural networks, and clustering.",
            credits: 3,
            semester: "Fall 2026",
            departmentId: cseDept._id,
            lecturerId: turing._id,
            materials: [
                {
                    title: "Lecture 1: Linear Regression & Gradient Descent",
                    fileUrl: "https://example.com/materials/cse401/lecture1.pdf",
                    fileType: "pdf"
                }
            ]
        });

        const cse302 = await Course.create({
            code: "CSE302",
            name: "Compiler Design",
            description: "Theory and practice of compiler construction. Lexical analysis, syntactic analysis, semantic translation, code generation, and optimization.",
            credits: 3,
            semester: "Fall 2026",
            departmentId: cseDept._id,
            lecturerId: hopper._id,
            materials: [
                {
                    title: "Compiler Architecture Overview",
                    fileUrl: "https://example.com/materials/cse302/intro.ppt",
                    fileType: "powerpoint"
                }
            ]
        });

        const se301 = await Course.create({
            code: "SE301",
            name: "Software Architecture & Design Patterns",
            description: "Advanced topics in software engineering. Architectural patterns (Microservices, MVC, Event-driven) and classic GoF design patterns (Singleton, Factory, Observer).",
            credits: 3,
            semester: "Fall 2026",
            departmentId: seDept._id,
            lecturerId: lovelace._id,
            materials: [
                {
                    title: "Creational & Structural Patterns",
                    fileUrl: "https://example.com/materials/se301/design_patterns.pdf",
                    fileType: "pdf"
                }
            ]
        });

        const it202 = await Course.create({
            code: "IT202",
            name: "Modern Web Development",
            description: "Practical guide to building complete modern web applications. Cover HTML5, CSS3, ES6+, React, Node.js, Express, and MongoDB integration.",
            credits: 3,
            semester: "Fall 2026",
            departmentId: itDept._id,
            lecturerId: lovelace._id,
            materials: [
                {
                    title: "Week 1: Introduction to React & Component State",
                    fileUrl: "https://example.com/materials/it202/week1_react.pdf",
                    fileType: "pdf"
                }
            ]
        });

        console.log(`✅ Seeded 5 Courses: CSE201, CSE401, CSE302, SE301, IT202`);

        // ==========================================
        // 5. SEED ENROLLMENTS
        // ==========================================
        console.log("\n📝 Seeding Student Enrollments...");

        // Linus Torvalds enrollments
        await Enrollment.create({
            studentId: linus._id,
            courseId: cse201._id,
            status: "approved",
            semester: "Fall 2026"
        });
        await Enrollment.create({
            studentId: linus._id,
            courseId: cse401._id,
            status: "approved",
            semester: "Fall 2026"
        });

        // Steve Wozniak enrollments
        await Enrollment.create({
            studentId: woz._id,
            courseId: cse201._id,
            status: "approved",
            semester: "Fall 2026"
        });
        await Enrollment.create({
            studentId: woz._id,
            courseId: cse302._id,
            status: "pending", // Pending request
            semester: "Fall 2026"
        });

        // Margaret Hamilton enrollments
        await Enrollment.create({
            studentId: hamilton._id,
            courseId: se301._id,
            status: "approved",
            semester: "Fall 2026"
        });
        await Enrollment.create({
            studentId: hamilton._id,
            courseId: it202._id,
            status: "approved",
            semester: "Fall 2026"
        });

        console.log("✅ Seeded Active & Pending Course Enrollments.");

        // ==========================================
        // 6. SEED ANNOUNCEMENTS
        // ==========================================
        console.log("\n📢 Seeding Course Announcements...");

        // Course announcement in DSA (CSE201)
        await Announcement.create({
            title: "Welcome to Data Structures & Algorithms!",
            content: "Welcome everyone. Please make sure to download the Lecture 1 slides and review basic C++/Java coding structures before our first lecture this Monday.",
            scope: "course",
            targetId: cse201._id,
            authorId: turing._id,
            priority: "high"
        });

        // Course announcement in Web Dev (IT202)
        await Announcement.create({
            title: "Required Textbooks and Software",
            content: "We will be using VS Code, Node.js, and MongoDB Community Edition. Please complete installation before our first lab session.",
            scope: "course",
            targetId: it202._id,
            authorId: lovelace._id,
            priority: "normal"
        });

        console.log("✅ Seeded Announcements.");

        // ==========================================
        // 7. SEED ASSIGNMENTS
        // ==========================================
        console.log("\n✏️ Seeding Assignments...");

        // DSA Assignment
        await Assignment.create({
            courseId: cse201._id,
            title: "Programming Assignment 1: Self-Balancing Trees",
            description: "Implement a Red-Black tree insertion and deletion algorithms in C++ or Java. Evaluate performance metrics and compile a PDF report.",
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
            maxMarks: 100
        });

        // Web Dev Assignment
        await Assignment.create({
            courseId: it202._id,
            title: "Lab Assignment 1: Portfolio website",
            description: "Create a fully responsive personal portfolio webpage using HTML5, CSS3 Grid/Flexbox, and basic JavaScript interactions.",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            maxMarks: 50
        });

        console.log("✅ Seeded Assignments.");

        // ==========================================
        // 8. SEED TIMED QUIZZES
        // ==========================================
        console.log("\n⏱️ Seeding Interactive Quizzes...");

        // DSA Quiz
        const dsaQuiz = await Quiz.create({
            courseId: cse201._id,
            title: "Quiz 1: Big-O & Linked Lists",
            description: "Short theoretical quiz assessing your understanding of runtime analysis and dynamic memory pointers.",
            durationMinutes: 15,
            dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });

        // Questions for DSA Quiz
        await Question.create({
            quizId: dsaQuiz._id,
            text: "What is the worst-case runtime complexity of searching in a standard Binary Search Tree (BST)?",
            type: "mcq",
            options: [
                "O(1)",
                "O(log n)",
                "O(n)",
                "O(n log n)"
            ],
            correctAnswer: "2", // Index 2 -> O(n)
            points: 2
        });

        await Question.create({
            quizId: dsaQuiz._id,
            text: "A doubly linked list node stores references to both the next and the previous nodes.",
            type: "true_false",
            options: ["True", "False"],
            correctAnswer: "true",
            points: 1
        });

        await Question.create({
            quizId: dsaQuiz._id,
            text: "What is the amortized runtime complexity of inserting an element at the back of a dynamic array (e.g. ArrayList)?",
            type: "short_answer",
            options: [],
            correctAnswer: "O(1)",
            points: 2
        });

        // Web Dev Quiz
        const webQuiz = await Quiz.create({
            courseId: it202._id,
            title: "Quiz 1: HTML & CSS Core",
            description: "Quick test of HTML semantics, selectors, and the CSS box model.",
            durationMinutes: 20,
            dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
        });

        await Question.create({
            quizId: webQuiz._id,
            text: "Which HTML5 semantic element is most appropriate for a standalone piece of self-contained content (e.g., blog post)?",
            type: "mcq",
            options: [
                "<section>",
                "<article>",
                "<div>",
                "<aside>"
            ],
            correctAnswer: "1", // Index 1 -> <article>
            points: 2
        });

        await Question.create({
            quizId: webQuiz._id,
            text: "The 'box-sizing: border-box' rule includes padding and border in the element's total width and height.",
            type: "true_false",
            options: ["True", "False"],
            correctAnswer: "true",
            points: 1
        });

        console.log("✅ Seeded Timed Quizzes and Questions.");

        // ==========================================
        // 9. SEED DISCUSSIONS (FORUM)
        // ==========================================
        console.log("\n💬 Seeding Forum Discussion Threads...");

        // DSA Thread
        const dsaThread = await ForumThread.create({
            courseId: cse201._id,
            title: "Re: Homework 1 - AVL Tree Rotations",
            content: "Hello everyone, I am having trouble understanding when to apply a Double Left-Right (LR) rotation versus a Single Left (L) rotation. Can anyone explain the conditions?",
            authorId: linus._id
        });

        await ForumComment.create({
            threadId: dsaThread._id,
            content: "Hi Linus, a double rotation is needed when the child node and the grandchild node are in different directions (i.e., the imbalance is 'left-right' or 'right-left'). If they are in the same direction, a single rotation suffices.",
            authorId: hamilton._id
        });

        await ForumComment.create({
            threadId: dsaThread._id,
            content: "Spot on Margaret! I will review this in detail during Monday's tutorial session. I recommend drawing out the trees on paper first.",
            authorId: turing._id
        });

        console.log("✅ Seeded Discussion Threads and Comments.");

        console.log("\n🎉 DATABASE SEEDING COMPLETED SUCCESSFULY!");
        console.log("🌱 Database is fully loaded with Software and IT course resources.");
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding database failed:", error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();

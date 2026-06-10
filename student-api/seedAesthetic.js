// ==========================================================================
// SEED SVIAS AESTHETIC STUDIES DATABASE RECORDS
// Run this script using: node seedAesthetic.js
// ==========================================================================

require("dotenv").config();
const mongoose = require("mongoose");

// Import models
const Faculty = require("./src/models/Faculty");
const Department = require("./src/models/Department");
const User = require("./src/models/User");
const Student = require("./src/models/Student");
const Lecturer = require("./src/models/Lecturer");
const Course = require("./src/models/Course");
const Exam = require("./src/models/Exam");
const Enrollment = require("./src/models/Enrollment");
const CourseMaterial = require("./src/models/CourseMaterial");
const Assignment = require("./src/models/Assignment");
const Submission = require("./src/models/Submission");
const Quiz = require("./src/models/Quiz");
const Question = require("./src/models/Question");
const Result = require("./src/models/Result");
const Announcement = require("./src/models/Announcement");
const ForumThread = require("./src/models/ForumThread");
const ForumComment = require("./src/models/ForumComment");
const Venue = require("./src/models/Venue");
const Event = require("./src/models/Event");
const Timetable = require("./src/models/Timetable");


const seedDatabase = async () => {
    try {
        console.log("🍃 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected successfully!\n");

        // ==========================================
        // 1. CLEANUP ALL EXISTING RECORDS
        // ==========================================
        console.log("🧹 Wiping database and preparing fresh SVIAS seed...");
        
        const collections = Object.keys(mongoose.connection.collections);
        for (const name of collections) {
            try {
                await mongoose.connection.collections[name].drop();
                console.log(`🧹 Dropped collection: ${name}`);
            } catch (err) {
                // Ignore error if collection doesn't exist
            }
        }

        console.log("🗑️ Cleanup completed.\n");

        // ==========================================
        // 2. CREATE FACULTY & DEPARTMENTS
        // ==========================================
        console.log("🏫 Seeding Faculty & Departments...");
        
        const sviasFaculty = await Faculty.create({
            name: "Faculty of Aesthetic Studies",
            description: "Dedicated to the preservation, practice, and academic development of traditional and contemporary performing arts, music, and fine arts."
        });

        const musicDept = await Department.create({
            name: "Department of Music",
            code: "MUS",
            facultyId: sviasFaculty._id
        });

        const danceDept = await Department.create({
            name: "Department of Dance",
            code: "DNC",
            facultyId: sviasFaculty._id
        });

        const dramaDept = await Department.create({
            name: "Department of Drama & Theatre",
            code: "THE",
            facultyId: sviasFaculty._id
        });

        const visualDept = await Department.create({
            name: "Department of Visual & Technological Arts",
            code: "VTA",
            facultyId: sviasFaculty._id
        });

        console.log(`✅ Seeded Faculty: ${sviasFaculty.name}`);
        console.log(`✅ Seeded Departments: Music, Dance, Drama & Theatre, Visual & Technological Arts\n`);

        // ==========================================
        // 3. CREATE USERS
        // ==========================================
        console.log("👥 Seeding Users & Creating Role Profiles...");

        // 3a. Administrator
        const adminUser = await User.create({
            name: "SVIAS System Admin",
            email: "admin@unilms.edu",
            password: "Admin@12345",
            role: "admin",
            firstLogin: false,
            isActive: true,
            department: "Administration",
            registrationNumber: "ADMIN-001"
        });

        // 3b. Examination Officer (Admin Role)
        const examOfficer = await User.create({
            name: "Mr. Shanmugavadivel",
            email: "exam.officer@unilms.edu",
            password: "Exam@12345",
            role: "admin",
            firstLogin: false,
            isActive: true,
            department: "Examinations Department",
            registrationNumber: "EXAM-001"
        });

        // 3c. Heads of Department (HODs - Lecturer Role)
        const musicHodUser = await User.create({
            name: "Dr. K. Ravichandra",
            email: "music.hod@unilms.edu",
            password: "Hod@12345",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Music",
            registrationNumber: "HOD-MUS-001"
        });
        const musicHodProfile = await Lecturer.create({
            userId: musicHodUser._id,
            departmentId: musicDept._id,
            employeeId: "EMP-MUS-HOD",
            specialization: "Carnatic Music Composition",
            qualifications: ["PhD in Musicology (BHU)", "M.Music (Madras)"],
            biography: "Dean-in-charge and Head of the Department of Music. Renowned Veena expert."
        });

        const danceHodUser = await User.create({
            name: "Prof. (Mrs.) Kamala Jayanthi",
            email: "dance.hod@unilms.edu",
            password: "Hod@12345",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Dance",
            registrationNumber: "HOD-DNC-001"
        });
        const danceHodProfile = await Lecturer.create({
            userId: danceHodUser._id,
            departmentId: danceDept._id,
            employeeId: "EMP-DNC-HOD",
            specialization: "Bharatanatyam Shastras",
            qualifications: ["PhD in Dance (Kalakshetra)", "MFA (Dance)"],
            biography: "Eminent Bharatanatyam guru and researcher of traditional Sri Lankan dance forms."
        });

        // 3d. Lecturers
        const musicLecturerUser = await User.create({
            name: "Mrs. Saraswathy M.",
            email: "saraswathy.m@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Music",
            registrationNumber: "L-MUS-001"
        });
        const musicLecturerProfile = await Lecturer.create({
            userId: musicLecturerUser._id,
            departmentId: musicDept._id,
            employeeId: "EMP-MUS-L1",
            specialization: "Carnatic Vocal & Violin theory",
            qualifications: ["M.Phil in Vocal (Madras University)", "Sangeet Nipun"],
            biography: "Senior Lecturer in Carnatic Vocal with 15+ years teaching students traditional ragas."
        });

        const danceLecturerUser = await User.create({
            name: "Mrs. Rukmani D.",
            email: "rukmani.d@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Dance",
            registrationNumber: "L-DNC-001"
        });
        const danceLecturerProfile = await Lecturer.create({
            userId: danceLecturerUser._id,
            departmentId: danceDept._id,
            employeeId: "EMP-DNC-L1",
            specialization: "Abhinaya & Traditional Nritta",
            qualifications: ["Diploma in Bharatanatyam (Kalakshetra)", "BFA (Dance)"],
            biography: "Passionate tutor focused on practical stage expressions and dance aesthetics."
        });

        const dramaLecturerUser = await User.create({
            name: "Mr. Kandiah S.",
            email: "kandiah.s@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Drama & Theatre",
            registrationNumber: "L-THE-001"
        });
        const dramaLecturerProfile = await Lecturer.create({
            userId: dramaLecturerUser._id,
            departmentId: dramaDept._id,
            employeeId: "EMP-THE-L1",
            specialization: "Traditional Folk Theatre (Koothu)",
            qualifications: ["MA in Drama (Eastern University)", "Diploma in Folk Theatre"],
            biography: "Pioneer in revitalizing North-Eastern Sri Lankan folk theatre and playwriting."
        });

        const visualLecturerUser = await User.create({
            name: "Mr. Ananda C.",
            email: "ananda.c@unilms.edu",
            password: "Lecturer@123",
            role: "lecturer",
            firstLogin: false,
            isActive: true,
            department: "Department of Visual & Technological Arts",
            registrationNumber: "L-VTA-001"
        });
        const visualLecturerProfile = await Lecturer.create({
            userId: visualLecturerUser._id,
            departmentId: visualDept._id,
            employeeId: "EMP-VTA-L1",
            specialization: "Traditional Paintings & Clay Sculpture",
            qualifications: ["MFA (Painting) (UVA Colombo)", "BFA (Sculpture)"],
            biography: "Folk mural restoration artist and supervisor for contemporary visual galleries."
        });

        // 3e. Students
        const student1User = await User.create({
            name: "Dhivya Muruges",
            email: "dhivy.m@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Department of Music",
            registrationNumber: "S-MUS-001"
        });
        const student1Profile = await Student.create({
            userId: student1User._id,
            departmentId: musicDept._id,
            registrationNumber: "S-MUS-001",
            academicYear: "3rd Year",
            semester: 1,
            gpa: 3.82
        });

        const student2User = await User.create({
            name: "Menaka Kulan",
            email: "menaka.k@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Department of Dance",
            registrationNumber: "S-DNC-001"
        });
        const student2Profile = await Student.create({
            userId: student2User._id,
            departmentId: danceDept._id,
            registrationNumber: "S-DNC-001",
            academicYear: "2nd Year",
            semester: 2,
            gpa: 3.45
        });

        const student3User = await User.create({
            name: "Tharan Senthil",
            email: "tharan.s@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Department of Drama & Theatre",
            registrationNumber: "S-THE-001"
        });
        const student3Profile = await Student.create({
            userId: student3User._id,
            departmentId: dramaDept._id,
            registrationNumber: "S-THE-001",
            academicYear: "4th Year",
            semester: 1,
            gpa: 3.90
        });

        const student4User = await User.create({
            name: "Vasuki Raj",
            email: "vasuki.r@student.unilms.edu",
            password: "Student@123",
            role: "student",
            firstLogin: false,
            isActive: true,
            department: "Department of Visual & Technological Arts",
            registrationNumber: "S-VTA-001"
        });
        const student4Profile = await Student.create({
            userId: student4User._id,
            departmentId: visualDept._id,
            registrationNumber: "S-VTA-001",
            academicYear: "1st Year",
            semester: 1,
            gpa: 3.20
        });

        console.log(`✅ Seeded Admins, HODs, Lecturers, and Students successfully.`);

        // ==========================================
        // 4. CREATE COURSES
        // ==========================================
        console.log("\n📘 Seeding Courses...");

        // Music Courses
        const mus101 = await Course.create({
            code: "MUS101",
            name: "Introduction to Carnatic Music",
            description: "Foundational theory of Carnatic music. Explores the swaras, basic ragas, and talas of South Indian classical music.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: musicDept._id,
            lecturerId: musicLecturerUser._id
        });

        const mus202 = await Course.create({
            code: "MUS202",
            name: "Applied Vocal Music I",
            description: "Practical exercises in vocal production, breathing, and performance. In-depth study of Alankaras and Geethams.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: musicDept._id,
            lecturerId: musicLecturerUser._id
        });

        // Dance Courses
        const dnc101 = await Course.create({
            code: "DNC101",
            name: "Fundamentals of Bharatanatyam",
            description: "Introduction to basic steps (Adavus), hand gestures (Mudras), and expressions (Abhinaya) in Bharatanatyam.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: danceDept._id,
            lecturerId: danceLecturerUser._id
        });

        const dnc203 = await Course.create({
            code: "DNC203",
            name: "Traditional Dance Forms of Sri Lanka",
            description: "Explores Kandyan, Low Country, and Sabaragamuwa folk dance styles, their rhythm patterns, and historical background.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: danceDept._id,
            lecturerId: danceLecturerUser._id
        });

        // Drama Courses
        const the101 = await Course.create({
            code: "THE101",
            name: "Sri Lankan Traditional Theatre",
            description: "Study of traditional Sri Lankan theatre forms like Koothu, Kolam, and Nadagam. Incorporates script writing and practical acting.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: dramaDept._id,
            lecturerId: dramaLecturerUser._id
        });

        // Visual Arts Courses
        const vta101 = await Course.create({
            code: "VTA101",
            name: "Traditional Visual Arts of Sri Lanka",
            description: "Study of rock paintings, murals, traditional pottery, wood carvings, and aesthetic craft practices of Sri Lanka.",
            credits: 3,
            semester: "Semester I 2026",
            departmentId: visualDept._id,
            lecturerId: visualLecturerUser._id
        });

        console.log(`✅ Seeded 6 Courses: MUS101, MUS202, DNC101, DNC203, THE101, VTA101`);

        // ==========================================
        // 5. SEED COURSE MATERIALS (Standalone collection)
        // ==========================================
        console.log("\n📁 Seeding Course Materials...");

        await CourseMaterial.create([
            {
                courseId: mus101._id,
                title: "Introduction to Swaras & Ragas Notes (PDF)",
                fileUrl: "https://example.com/svias/materials/mus101_swaras.pdf",
                fileType: "pdf",
                uploadedBy: musicLecturerUser._id
            },
            {
                courseId: mus202._id,
                title: "Geetham Performance Sample (Audio)",
                fileUrl: "https://example.com/svias/materials/mus202_geetham.mp3",
                fileType: "audio",
                uploadedBy: musicLecturerUser._id
            },
            {
                courseId: dnc101._id,
                title: "Bharatanatyam Mudras Reference Guide",
                fileUrl: "https://example.com/svias/materials/dnc101_mudras.pdf",
                fileType: "pdf",
                uploadedBy: danceLecturerUser._id
            },
            {
                courseId: dnc101._id,
                title: "Basic Adavu Steps Demonstration (Video)",
                fileUrl: "https://example.com/svias/materials/dnc101_adavu.mp4",
                fileType: "video",
                uploadedBy: danceLecturerUser._id
            },
            {
                courseId: the101._id,
                title: "Koothu Folk Rhythms Guide",
                fileUrl: "https://example.com/svias/materials/the101_koothu.pptx",
                fileType: "powerpoint",
                uploadedBy: dramaLecturerUser._id
            }
        ]);

        console.log("✅ Seeded stand-alone Course Materials.");

        // ==========================================
        // 6. SEED ENROLLMENTS
        // ==========================================
        console.log("\n📝 Seeding Student Enrollments...");

        // Dhivya (Music Student) -> Music courses
        await Enrollment.create({
            studentId: student1User._id,
            courseId: mus101._id,
            status: "approved",
            semester: "Semester I 2026"
        });
        await Enrollment.create({
            studentId: student1User._id,
            courseId: mus202._id,
            status: "approved",
            semester: "Semester I 2026"
        });

        // Menaka (Dance Student) -> Dance courses
        await Enrollment.create({
            studentId: student2User._id,
            courseId: dnc101._id,
            status: "approved",
            semester: "Semester I 2026"
        });
        await Enrollment.create({
            studentId: student2User._id,
            courseId: dnc203._id,
            status: "approved",
            semester: "Semester I 2026"
        });

        // Tharan (Drama Student) -> Drama courses
        await Enrollment.create({
            studentId: student3User._id,
            courseId: the101._id,
            status: "approved",
            semester: "Semester I 2026"
        });

        // Vasuki (Visual Student) -> Visual Arts courses
        await Enrollment.create({
            studentId: student4User._id,
            courseId: vta101._id,
            status: "approved",
            semester: "Semester I 2026"
        });

        console.log("✅ Seeded course enrollments.");

        // ==========================================
        // 7. SEED VENUES
        // ==========================================
        console.log("\n🏛️ Seeding Venues...");

        const auditorium = await Venue.create({
            name: "Swami Vipulananda Memorial Auditorium",
            capacity: 250,
            type: "theatre",
            location: "Administrative Block Wing B"
        });

        const danceStudio = await Venue.create({
            name: "Dance Studio 1",
            capacity: 30,
            type: "studio",
            location: "Performing Arts Block GF"
        });

        const musicHall = await Venue.create({
            name: "Saraswathy Music Studio",
            capacity: 40,
            type: "studio",
            location: "Music Block Room 104"
        });

        const gallery = await Venue.create({
            name: "Visual Arts Gallery",
            capacity: 100,
            type: "gallery",
            location: "Fine Arts Block Wing C"
        });

        const lectureRoom = await Venue.create({
            name: "Lecture Hall 202",
            capacity: 60,
            type: "classroom",
            location: "Academic Block 2nd Floor"
        });

        console.log("✅ Seeded Venues.");

        // ==========================================
        // 8. SEED TIMETABLES
        // ==========================================
        console.log("\n📅 Seeding Timetables...");

        await Timetable.create([
            {
                courseId: mus101._id,
                lecturerId: musicLecturerUser._id,
                venueId: musicHall._id,
                dayOfWeek: "Monday",
                startTime: "09:00",
                endTime: "11:00",
                semester: "Semester I 2026"
            },
            {
                courseId: mus202._id,
                lecturerId: musicLecturerUser._id,
                venueId: auditorium._id,
                dayOfWeek: "Wednesday",
                startTime: "13:00",
                endTime: "15:00",
                semester: "Semester I 2026"
            },
            {
                courseId: dnc101._id,
                lecturerId: danceLecturerUser._id,
                venueId: danceStudio._id,
                dayOfWeek: "Tuesday",
                startTime: "10:00",
                endTime: "12:00",
                semester: "Semester I 2026"
            },
            {
                courseId: dnc203._id,
                lecturerId: danceLecturerUser._id,
                venueId: auditorium._id,
                dayOfWeek: "Thursday",
                startTime: "14:00",
                endTime: "16:00",
                semester: "Semester I 2026"
            },
            {
                courseId: the101._id,
                lecturerId: dramaLecturerUser._id,
                venueId: auditorium._id,
                dayOfWeek: "Friday",
                startTime: "09:30",
                endTime: "12:30",
                semester: "Semester I 2026"
            },
            {
                courseId: vta101._id,
                lecturerId: visualLecturerUser._id,
                venueId: gallery._id,
                dayOfWeek: "Tuesday",
                startTime: "13:00",
                endTime: "16:00",
                semester: "Semester I 2026"
            }
        ]);

        console.log("✅ Seeded Lecture Timetables.");

        // ==========================================
        // 9. SEED EVENTS
        // ==========================================
        console.log("\n🎨 Seeding Aesthetic Events...");

        const concert = await Event.create({
            title: "Navarathiri Sangeetha Vizha 2026",
            description: "An evening of traditional Carnatic vocal recitals and classical instrumental violin recitals by the SVIAS Music students.",
            date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days out
            venueId: auditorium._id,
            organizerId: musicLecturerUser._id,
            type: "performance",
            maxParticipants: 200,
            participants: [student1User._id, student2User._id]
        });

        const exhibition = await Event.create({
            title: "Sri Lankan Heritage Mural Art Exhibition",
            description: "Showcasing student paintings, restoring traditional Sri Lankan temple murals, pottery work, and clay sculptures.",
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days out
            venueId: gallery._id,
            organizerId: visualLecturerUser._id,
            type: "exhibition",
            maxParticipants: 100,
            participants: [student4User._id]
        });

        console.log("✅ Seeded SVIAS Events.");



        // ==========================================
        // 11. SEED EXAMS & RESULTS
        // ==========================================
        console.log("\n📝 Seeding Exam Schedules & Results...");

        const musExam = await Exam.create({
            courseId: mus101._id,
            name: "End-Semester Carnatic Theory Exam",
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            venueId: lectureRoom._id,
            maxMarks: 100,
            status: "published",
            createdBy: examOfficer._id
        });

        // Result for Dhivya (Music Student) -> MUS101 (scored 88/100 -> A+)
        await Result.create({
            examId: musExam._id,
            studentId: student1User._id,
            score: 88,
            totalMarks: 100,
            grade: "A+",
            gradePoints: 4.00,
            graded: true
        });
        await Enrollment.findOneAndUpdate(
            { studentId: student1User._id, courseId: mus101._id },
            { grade: "A+" }
        );

        const dncExam = await Exam.create({
            courseId: dnc101._id,
            name: "Mid-Term Bharatanatyam Practical Exam",
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            venueId: danceStudio._id,
            maxMarks: 100,
            status: "published",
            createdBy: examOfficer._id
        });

        // Result for Menaka (Dance Student) -> DNC101 (scored 67/100 -> B)
        await Result.create({
            examId: dncExam._id,
            studentId: student2User._id,
            score: 67,
            totalMarks: 100,
            grade: "B",
            gradePoints: 3.00,
            graded: true
        });
        await Enrollment.findOneAndUpdate(
            { studentId: student2User._id, courseId: dnc101._id },
            { grade: "B" }
        );

        console.log("✅ Seeded Exams and Results.");



        console.log("\n🎉 SVIAS AESTHETIC STUDIES SEEDING COMPLETED SUCCESSFULLY!");
        console.log("👉 Defaults:");
        console.log("   - Admin: admin@unilms.edu | Admin@12345");
        console.log("   - Exam Officer (Admin): exam.officer@unilms.edu | Exam@12345");
        console.log("   - HOD Music (Lecturer): music.hod@unilms.edu | Hod@12345");
        console.log("   - Lecturer Music: saraswathy.m@unilms.edu | Lecturer@123");
        console.log("   - Student Music: dhivy.m@student.unilms.edu | Student@123\n");
        
        mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding database failed:", error.message);
        mongoose.connection.close();
        process.exit(1);
    }
};

seedDatabase();

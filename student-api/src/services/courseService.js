// ============================================
// COURSE SERVICE - Business Logic Layer
// ============================================

const Course = require("../models/Course");
const Student = require("../models/Student");

/**
 * ENROLL STUDENT IN COURSE
 * Handles verification of availability and references linking.
 */
exports.enrollStudentInCourse = async (studentId, courseId) => {
    // 1. Fetch Student and Course from Database
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
        throw new Error("Student not found");
    }
    if (!course) {
        throw new Error("Course not found");
    }

    // 2. Check if student is already enrolled in this course
    if (course.enrolledStudents.some((id) => id.toString() === studentId.toString())) {
        throw new Error("Student is already enrolled in this course");
    }

    // 3. Check if course is at capacity
    if (course.enrolledStudents.length >= course.capacity) {
        throw new Error("Course is already full. Enrollment capacity reached");
    }

    // 4. Update Course enrolledStudents array
    course.enrolledStudents.push(studentId);
    await course.save();

    // 5. Update Student enrolledCourses array
    student.enrolledCourses.push(courseId);
    await student.save();

    return {
        studentName: student.name,
        courseTitle: course.title,
        totalEnrolled: course.enrolledStudents.length
    };
};

/**
 * UNENROLL STUDENT FROM COURSE
 * Removes references from both Course and Student documents.
 */
exports.unenrollStudentFromCourse = async (studentId, courseId) => {
    // 1. Fetch Student and Course from Database
    const student = await Student.findById(studentId);
    const course = await Course.findById(courseId);

    if (!student) {
        throw new Error("Student not found");
    }
    if (!course) {
        throw new Error("Course not found");
    }

    // 2. Check if student is enrolled in this course
    const enrolledIndex = course.enrolledStudents.findIndex(
        (id) => id.toString() === studentId.toString()
    );
    if (enrolledIndex === -1) {
        throw new Error("Student is not enrolled in this course");
    }

    // 3. Remove student reference from Course
    course.enrolledStudents.splice(enrolledIndex, 1);
    await course.save();

    // 4. Remove course reference from Student
    const courseIndex = student.enrolledCourses.findIndex(
        (id) => id.toString() === courseId.toString()
    );
    if (courseIndex !== -1) {
        student.enrolledCourses.splice(courseIndex, 1);
        await student.save();
    }

    return {
        studentName: student.name,
        courseTitle: course.title,
        totalEnrolled: course.enrolledStudents.length
    };
};

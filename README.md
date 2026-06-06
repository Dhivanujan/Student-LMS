# 🎓 Student-LMS: Student Course & Learning Management System

Student-LMS is a full-featured, responsive, and secure Learning Management System (LMS) designed for academic institutions to manage students, courses, enrollments, announcements, attendance, assignments, quizzes, and discussion forums. 

It is built as a MERN stack application, leveraging a decoupled architecture with a Node.js/Express REST API backend and a Vite/React SPA frontend.

---

## 🚀 Key Features

### 👤 User Portals & Role-Based Access Control (RBAC)
- **Administrator Panel**: Manage users (create, edit, delete, activate/deactivate), reset passwords, create departments and faculties, view audit logs, and view aggregate analytical reports.
- **Lecturer (Instructor) Portal**: Design and manage courses, upload lecture materials, create assignments, construct timed quizzes, track attendance, post announcements, and grade student submissions.
- **Student Portal**: Explore the course catalog, request enrollments, view course syllabus and download materials, submit assignments, take timed interactive quizzes, check attendance, and view grades/feedback.

### 📚 Course & Enrollment Management
- Catalog of all active courses with filtering.
- Direct student enrollment request and administrator approval workflow.
- Assignment of lecturers to courses by administrators.

### ✍️ Assignments & Interactive Quizzes
- PDF/document assignment uploads by lecturers.
- Student submission interface with status tracking.
- Timed quiz engine supporting multiple-choice, true/false, and short-answer questions.
- Detailed quiz results with correct answers and score calculation.

### 💬 Engagement & Communications
- **Announcements**: Dynamic announcement feeds for courses and general system announcements.
- **Discussion Forums**: Course-specific threads and comment sections to facilitate peer-to-peer and student-lecturer interaction.
- **System Notifications**: Automatic alerts for new enrollments, announcements, graded assignments, and quiz schedules.

---

## 🛠️ Technology Stack

| Layer | Technology | Key Packages / Libraries |
| :--- | :--- | :--- |
| **Frontend** | React (Vite SPA) | `react-router-dom` (v7), `axios`, Context API, CSS modules / Vanilla CSS |
| **Backend** | Node.js, Express | `mongoose`, `jsonwebtoken` (JWT), `bcryptjs`, `multer` |
| **Database** | MongoDB | Mongoose ODM schemas and hooks |

---

## 📦 Project Structure

```text
Student Course Management/
├── frontend/               # React Client SPA (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI Components & Role Dashboards
│   │   ├── context/        # Authentication & Session State Providers
│   │   ├── pages/          # View Pages (Admin, Catalog, Dashboard, etc.)
│   │   ├── services/       # Axios API client setup and interceptors
│   │   ├── App.jsx         # Client-side routing and protected route guards
│   │   └── index.css       # Core styling system
│   └── package.json        # Frontend dependencies & scripts
│
└── student-api/            # Node.js Express Backend REST API
    ├── src/
    │   ├── config/         # Database connection & Superadmin seeding logic
    │   ├── controllers/    # Route controllers (Auth, Course, Quiz, etc.)
    │   ├── middleware/     # Auth checks, role authorization, uploads
    │   ├── models/         # Mongoose Data Schemas (User, Course, etc.)
    │   ├── routes/         # Express API route declarations
    │   └── services/       # Secondary backend logic/services
    ├── server.js           # Express App entry point
    └── package.json        # Backend dependencies & scripts
```

---

## ⚙️ Configuration & Environment Variables

Create a `.env` file inside the `student-api` directory. A sample configuration is shown below:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/student-management-api
JWT_SECRET=super_secret_key_123456789_student_app
JWT_EXPIRE=30d
```

---

## ⚡ Setup & Installation

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB** (Local instance or Atlas cloud cluster)
- **npm** (v9 or higher)

### Step 1: Start MongoDB
Ensure your local MongoDB instance is running:
```bash
# On Windows (Services or Command Prompt depending on setup)
net start MongoDB
```

### Step 2: Set Up & Run the Backend API
1. Navigate to the `student-api` directory:
   ```bash
   cd student-api
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create the `.env` file as described in the Configuration section.
4. Run the server in development mode:
   ```bash
   npm run dev
   ```
   *The server starts on `http://localhost:5000` by default. It will automatically connect to MongoDB and output health check links.*

### Step 3: Set Up & Run the Frontend Client
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will be accessible at `http://localhost:5173` (or the port displayed in your terminal).*

---

## 🛡️ Database Seeding & Default Credentials

On database startup, if no Administrator account is found, the backend automatically seeds a default superadmin account:

- **Email**: `admin@unilms.edu`
- **Password**: `Admin@12345`

*Note: On your first login as any user, you will be automatically redirected to the Change Password screen (`/change-password`) to force a password update for security.*

---

## 📊 Database Models (Schemas)

The application models the school environment using 16 Mongoose schemas:

1. **User**: Credentials, role (`student`, `lecturer`, `admin`), active status, department, and registration number.
2. **Course**: General metadata, assigned lecturer, syllabus, materials array, and lists of enrolled students.
3. **Enrollment**: Many-to-many relationship between Users (students) and Courses, tracking status (`active`, `completed`, `dropped`) and overall grade.
4. **Assignment**: Tasks created for a course containing instructions, due date, and maximum marks.
5. **Submission**: Student submissions for assignments, tracking file URLs, grades, and lecturer feedback.
6. **Quiz**: Timed tests containing multiple questions.
7. **Question**: Individual quiz questions (multiple-choice options, true/false, short answers).
8. **Result**: Completed quiz attempts by students, storing scores and responses.
9. **Attendance**: Course-specific attendance records mapped by date, tracking student statuses (`present`, `absent`, `late`).
10. **Announcement**: Notice board posts targeted to specific courses.
11. **ForumThread & ForumComment**: Discursive structures for course collaboration.
12. **Notification**: User-specific real-time alerts.
13. **AuditLog**: System-wide logging of administrative actions for security audits.
14. **Faculty & Department**: Academic organizational hierarchy.

---

## 📡 API Reference (Endpoints)

All API endpoints require a Bearer token in the `Authorization` header (`Authorization: Bearer <token>`) except public auth routes.

### Authentication & Profile (`/api/auth`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Authenticate user and receive token | Public |
| GET | `/me` | Get current logged-in user profile | Authenticated |
| PUT | `/profile` | Update profile details / profile picture | Authenticated |
| PUT | `/change-password` | Update account password | Authenticated |
| POST | `/forgot-password` | Generate reset token and email link | Public |
| POST | `/reset-password/:token` | Reset password using a valid token | Public |

### User Management (`/api/users`)
*All endpoints require **Admin** permissions.*
| Method | Path | Description |
| :--- | :--- | :--- |
| GET | `/` | List all system users with filters |
| POST | `/` | Create a new user (Student, Lecturer, Admin) |
| PUT | `/:id` | Update user details |
| DELETE | `/:id` | Delete a user |
| PUT | `/:id/reset-password` | Force administrative password reset |
| PUT | `/:id/toggle-status` | Enable or disable user login status |
| GET | `/audit-logs` | Retrieve chronological system audit logs |
| GET | `/departments` | List all academic departments |
| POST | `/departments` | Create a new department |
| GET | `/faculties` | List all academic faculties |
| POST | `/faculties` | Create a new faculty |

### Courses (`/api/courses`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/` | Retrieve all courses (or course catalog) | Authenticated |
| POST | `/` | Create a new course | Admin |
| GET | `/:id` | Get details of a single course | Authenticated |
| PUT | `/:id` | Update course details | Admin |
| DELETE | `/:id` | Delete a course | Admin |
| PUT | `/:id/assign-lecturer` | Assign instructor to course | Admin |
| POST | `/:id/materials` | Upload course material (PDF, doc, etc.) | Lecturer / Admin |
| DELETE | `/:id/materials/:materialId` | Delete uploaded material | Lecturer / Admin |

### Enrollments (`/api/enrollments`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/request` | Request enrollment in a course | Student |
| GET | `/` | Retrieve list of enrollments / enrollment requests | Lecturer / Admin |
| PUT | `/:id/approve` | Approve a student's enrollment request | Admin |
| PUT | `/:id/reject` | Reject a student's enrollment request | Admin |
| GET | `/student/me` | Retrieve enrolled courses for current student | Student |

### Assignments & Submissions (`/api/assignments`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create assignment & upload resource file | Lecturer / Admin |
| GET | `/course/:courseId` | Retrieve assignments for a specific course | Authenticated |
| GET | `/:id` | Get single assignment details | Authenticated |
| POST | `/:id/submit` | Submit assignment file | Student |
| PUT | `/submission/:submissionId/grade` | Grade student submission and give feedback | Lecturer / Admin |

### Quizzes (`/api/quizzes`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Create a timed course quiz | Lecturer / Admin |
| POST | `/:id/questions` | Add questions to a quiz | Lecturer / Admin |
| GET | `/course/:courseId` | Retrieve quizzes for a specific course | Authenticated |
| POST | `/:id/attempt` | Start a timed quiz session | Student |
| POST | `/:id/submit` | Submit completed quiz answers | Student |
| GET | `/:id/results` | Retrieve all student attempts for a quiz | Authenticated |
| PUT | `/result/:resultId/grade` | Manually override/grade quiz result | Lecturer / Admin |

### Announcements (`/api/announcements`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Post system-wide or course announcement | Lecturer / Admin |
| GET | `/feed` | Get unified announcement feed for the user | Authenticated |
| GET | `/course/:courseId` | Get announcements for a course | Authenticated |
| DELETE | `/:id` | Delete an announcement | Lecturer / Admin |

### Attendance (`/api/attendance`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/` | Record student attendance for a course date | Lecturer / Admin |
| GET | `/course/:courseId` | View attendance records for a course | Authenticated |
| GET | `/course/:courseId/stats` | View course-wide attendance percentages | Lecturer / Admin |

### Forum Discussions (`/api/forums`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| POST | `/threads` | Create a new discussion thread | Authenticated |
| GET | `/course/:courseId` | View all threads for a course | Authenticated |
| GET | `/threads/:threadId` | View thread details and comments | Authenticated |
| DELETE | `/threads/:threadId` | Delete discussion thread | Thread Author |
| POST | `/comments` | Comment on a thread | Authenticated |
| DELETE | `/comments/:commentId` | Delete forum comment | Comment Author |

### Reports & Analytics (`/api/reports`)
| Method | Path | Description | Access |
| :--- | :--- | :--- | :--- |
| GET | `/admin` | Retrieve system-wide analytical metrics | Admin |
| GET | `/lecturer` | Retrieve metrics for lecturer's classes | Lecturer / Admin |
| GET | `/student` | Retrieve student's academic progress report | Student |
| GET | `/export` | Export report data to file | Authenticated |

import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import ExamOfficerDashboard from "../components/RoleDashboards/ExamOfficerDashboard";

const ExamsPage = () => {
    const { user } = useContext(AuthContext);
    const [reportCard, setReportCard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStudentReport = async () => {
            if (user && user.role === "student") {
                try {
                    const res = await api.get("/exams/report-card");
                    setReportCard(res.data.data);
                } catch (err) {
                    console.error("Failed to load student report card:", err);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false); // Non-student roles use ExamOfficerDashboard directly
            }
        };

        fetchStudentReport();
    }, [user]);

    if (loading) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="skeleton mt-8" style={{ height: "300px" }}></div>
            </div>
        );
    }

    // If logged in as Exam Officer, HOD, or Admin, we can reuse/render the Exam Control dashboard
    if (user && ["exam_officer", "hod", "admin"].includes(user.role)) {
        return <ExamOfficerDashboard />;
    }

    // If student, render report card
    return (
        <div className="animate-fade-in p-6 max-w-4xl mx-auto">
            <div className="mb-8 border-b pb-4">
                <span className="badge badge-info mb-2 text-sm px-3 py-1 uppercase tracking-wide">Academic Record</span>
                <h1 className="text-3xl font-extrabold text-gray-800 font-heading">My Examination Results</h1>
                <p className="text-gray-500 text-sm mt-1">Official statement of published grades and cumulative GPA at SVIAS.</p>
            </div>

            {reportCard ? (
                <div className="flex flex-col gap-8">
                    {/* GPA Display Card */}
                    <div className="bg-gradient-to-r from-red-800 to-amber-600 text-white rounded-2xl p-6 shadow-md flex justify-between items-center">
                        <div>
                            <div className="text-xs uppercase font-bold tracking-wider opacity-75">Cumulative GPA</div>
                            <div className="text-3xl font-extrabold mt-1">{reportCard.gpa.toFixed(2)} / 4.00</div>
                            <div className="text-xs mt-2 opacity-90">Based on all published semester course exams.</div>
                        </div>
                        <div className="p-3 bg-white/10 rounded-xl">
                            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>

                    {/* Results Table */}
                    <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 font-heading border-b pb-2">Graded Course Summary</h3>
                        
                        {reportCard.results.length === 0 ? (
                            <p className="text-gray-400 italic text-sm text-center py-6">No exam grades have been published for you yet.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200 text-sm">
                                    <thead className="bg-gray-50 font-bold text-gray-600 uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-3 text-left">Code</th>
                                            <th className="px-6 py-3 text-left">Course Name</th>
                                            <th className="px-6 py-3 text-center">Credits</th>
                                            <th className="px-6 py-3 text-center">Marks</th>
                                            <th className="px-6 py-3 text-center">Grade</th>
                                            <th className="px-6 py-3 text-center">GP</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 bg-white text-gray-700">
                                        {reportCard.results.map((r, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50/55 transition">
                                                <td className="px-6 py-4 font-bold text-red-800 text-left">{r.courseCode}</td>
                                                <td className="px-6 py-4 font-medium text-gray-800 text-left">{r.courseName}</td>
                                                <td className="px-6 py-4 text-center">{r.credits}</td>
                                                <td className="px-6 py-4 text-center">{r.score} / {r.totalMarks}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                                                        r.grade === "F" ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
                                                    }`}>
                                                        {r.grade}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-bold">{r.gradePoints.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="empty-state bg-white p-12 rounded-2xl border text-center">
                    <h3 className="font-bold text-gray-700">Report card unavailable</h3>
                    <p className="text-gray-400 text-sm mt-1">Please contact the Examinations Officer to verify your academic records.</p>
                </div>
            )}
        </div>
    );
};

export default ExamsPage;

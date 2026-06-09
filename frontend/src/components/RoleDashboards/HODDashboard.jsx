import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";

const HODDashboard = () => {
    const { user } = useContext(AuthContext);
    const [metrics, setMetrics] = useState({ totalStudents: 0, totalLecturers: 0, totalCourses: 0 });
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [newAnn, setNewAnn] = useState({ title: "", content: "", priority: "normal" });
    const [allocation, setAllocation] = useState({ courseId: "", lecturerId: "" });
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchHODData = async () => {
            try {
                // Fetch department-filtered data based on HOD's department
                const [coursesRes, usersRes, annRes] = await Promise.all([
                    api.get(`/courses?department=${user.department}`),
                    api.get(`/users?department=${user.department}`),
                    api.get("/announcements/feed")
                ]);

                const allCourses = coursesRes.data.data;
                const allUsers = usersRes.data.data;

                const deptLecturers = allUsers.filter(u => u.role === "lecturer" || u.role === "hod");
                const deptStudents = allUsers.filter(u => u.role === "student");

                setCourses(allCourses);
                setLecturers(deptLecturers);
                setMetrics({
                    totalCourses: allCourses.length,
                    totalLecturers: deptLecturers.length,
                    totalStudents: deptStudents.length
                });

                // Filter announcements to display system and department ones
                const filteredAnn = annRes.data.data.filter(
                    a => a.scope === "system" || a.scope === "department"
                );
                setAnnouncements(filteredAnn.slice(0, 5));
            } catch (err) {
                console.error("Failed to load HOD dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchHODData();
        }
    }, [user]);

    // Handle course assignment
    const handleAllocate = async (e) => {
        e.preventDefault();
        if (!allocation.courseId || !allocation.lecturerId) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await api.put(`/courses/${allocation.courseId}/assign-lecturer`, {
                lecturerId: allocation.lecturerId
            });

            // Update local state
            setCourses(prev => prev.map(c => {
                if (c._id === allocation.courseId) {
                    const assignedLecturer = lecturers.find(l => l.id === allocation.lecturerId || l._id === allocation.lecturerId);
                    return { ...c, lecturerId: assignedLecturer };
                }
                return c;
            }));

            setMessage({ text: "Lecturer allocated successfully!", type: "success" });
            setAllocation({ courseId: "", lecturerId: "" });
        } catch (err) {
            console.error("Allocation failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to allocate lecturer.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Handle posting departmental announcements
    const handlePostAnnouncement = async (e) => {
        e.preventDefault();
        if (!newAnn.title || !newAnn.content) return;

        setActionLoading(true);
        try {
            const res = await api.post("/announcements", {
                title: newAnn.title,
                content: newAnn.content,
                scope: "department",
                priority: newAnn.priority
            });

            setAnnouncements(prev => [res.data.data, ...prev].slice(0, 5));
            setNewAnn({ title: "", content: "", priority: "normal" });
            setMessage({ text: "Department announcement posted!", type: "success" });
        } catch (err) {
            console.error("Post announcement failed:", err);
            setMessage({ text: "Failed to post announcement.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="animate-fade-in">
                <div className="skeleton skeleton-text" style={{ width: "350px", height: "2.5rem", marginBottom: "0.5rem" }}></div>
                <div className="skeleton skeleton-text" style={{ width: "200px", height: "1.2rem", marginBottom: "2rem" }}></div>
                <div className="stats-grid">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "130px" }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6">
            <div className="mb-6">
                <span className="badge badge-info mb-2 text-sm px-3 py-1 uppercase tracking-wide">Head of Department Portal</span>
                <h1 className="text-3xl font-bold text-gray-800 font-heading">{user.department}</h1>
                <p className="text-gray-500 text-sm mt-1">Manage allocations, monitor activities, and post announcements.</p>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="stat-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className="text-gray-400 font-medium text-sm uppercase">Total Department Students</h3>
                        <div className="p-2 rounded-xl bg-red-50 text-red-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-4">{metrics.totalStudents}</div>
                    <div className="text-xs text-gray-400 mt-2">Active enrollments this semester</div>
                </div>

                <div className="stat-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className="text-gray-400 font-medium text-sm uppercase">Lecturers & HOD</h3>
                        <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-4">{metrics.totalLecturers}</div>
                    <div className="text-xs text-gray-400 mt-2">Assigned academic members</div>
                </div>

                <div className="stat-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                        <h3 className="text-gray-400 font-medium text-sm uppercase">Academic Courses</h3>
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-4">{metrics.totalCourses}</div>
                    <div className="text-xs text-gray-400 mt-2">Active syllabus codes</div>
                </div>
            </div>

            {/* Notification Alert */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    {message.text}
                </div>
            )}

            {/* Interactive Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Course Allocations */}
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2 flex items-center gap-2">
                        <svg className="w-5 h-5 text-red-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        Lecturer Course Allocations
                    </h3>

                    {/* Allocation Form */}
                    <form onSubmit={handleAllocate} className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select Course</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={allocation.courseId} 
                                    onChange={e => setAllocation(prev => ({ ...prev, courseId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Assign Lecturer</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={allocation.lecturerId} 
                                    onChange={e => setAllocation(prev => ({ ...prev, lecturerId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Lecturer --</option>
                                    {lecturers.map(l => (
                                        <option key={l._id} value={l._id || l.id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={actionLoading}
                            className="btn btn-primary text-white bg-red-700 hover:bg-red-800 rounded-lg p-2 font-semibold text-sm transition self-end px-6"
                        >
                            {actionLoading ? "Allocating..." : "Allocate Instructor"}
                        </button>
                    </form>

                    {/* Courses Listing */}
                    <div className="flex flex-col gap-3">
                        <h4 className="text-sm font-bold text-gray-500 uppercase">Syllabus Grid Overview</h4>
                        {courses.length === 0 ? (
                            <p className="text-gray-400 text-sm italic">No courses found in this department.</p>
                        ) : (
                            <div className="max-h-72 overflow-y-auto flex flex-col gap-2">
                                {courses.map(c => (
                                    <div key={c._id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-sm shadow-sm hover:border-red-200 transition">
                                        <div>
                                            <div className="font-bold text-gray-800">{c.code}: {c.name}</div>
                                            <div className="text-xs text-gray-500 mt-1">Credits: {c.credits} | {c.semester}</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                            c.lecturerId ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                        }`}>
                                            {c.lecturerId ? `Instructor: ${c.lecturerId.name}` : "Unallocated"}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Announcements Feed & Publishing */}
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2 flex items-center gap-2">
                            <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                            </svg>
                            Department Announcements
                        </h3>

                        {/* Publish Announcement Form */}
                        <form onSubmit={handlePostAnnouncement} className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-100 flex flex-col gap-3">
                            <div className="form-group flex flex-col gap-1">
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    placeholder="Announcement Title"
                                    value={newAnn.title}
                                    onChange={e => setNewAnn(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <textarea 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white h-20"
                                    placeholder="Share department updates or requirements..."
                                    value={newAnn.content}
                                    onChange={e => setNewAnn(prev => ({ ...prev, content: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2 text-xs font-semibold">
                                    <span className="text-gray-500">Priority:</span>
                                    <label className="flex items-center gap-1 text-gray-700">
                                        <input 
                                            type="radio" 
                                            name="priority" 
                                            value="normal" 
                                            checked={newAnn.priority === "normal"}
                                            onChange={() => setNewAnn(prev => ({ ...prev, priority: "normal" }))}
                                        />
                                        Normal
                                    </label>
                                    <label className="flex items-center gap-1 text-red-700 font-bold">
                                        <input 
                                            type="radio" 
                                            name="priority" 
                                            value="high"
                                            checked={newAnn.priority === "high"}
                                            onChange={() => setNewAnn(prev => ({ ...prev, priority: "high" }))}
                                        />
                                        Urgent
                                    </label>
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="btn btn-primary text-white bg-amber-600 hover:bg-amber-700 rounded-lg p-2 font-semibold text-xs transition px-4"
                                >
                                    {actionLoading ? "Posting..." : "Post Notice"}
                                </button>
                            </div>
                        </form>

                        {/* Recent Notices */}
                        <div className="flex flex-col gap-3">
                            <h4 className="text-sm font-bold text-gray-500 uppercase">Active Notices Feed</h4>
                            {announcements.length === 0 ? (
                                <p className="text-gray-400 text-sm italic">No active notices.</p>
                            ) : (
                                <div className="flex flex-col gap-3 max-h-60 overflow-y-auto">
                                    {announcements.map(ann => (
                                        <div key={ann._id} className={`p-3 bg-gray-50 rounded-xl border-l-4 border-l-red-700 shadow-sm ${
                                            ann.priority === "high" ? "border-l-red-500 bg-red-50/20" : "border-l-gray-400"
                                        }`}>
                                            <div className="flex justify-between items-center text-xs font-bold text-gray-800 mb-1">
                                                <span>{ann.title}</span>
                                                <span className="text-gray-400 font-normal">{new Date(ann.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-gray-600 text-xs leading-relaxed">{ann.content}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HODDashboard;

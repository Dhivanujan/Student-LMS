import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const TimetablePage = () => {
    const { user } = useContext(AuthContext);
    const [slots, setSlots] = useState([]);
    const [courses, setCourses] = useState([]);
    const [lecturers, setLecturers] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // New slot form state
    const [newSlot, setNewSlot] = useState({
        courseId: "",
        lecturerId: "",
        venueId: "",
        dayOfWeek: "Monday",
        startTime: "",
        endTime: "",
        semester: "Semester I 2026"
    });

    const [dayFilter, setDayFilter] = useState("");
    const [message, setMessage] = useState({ text: "", type: "" });

    const fetchTimetableData = async () => {
        try {
            const [slotsRes, coursesRes, usersRes, venuesRes] = await Promise.all([
                api.get(`/timetables`),
                api.get("/courses"),
                api.get("/users?role=lecturer"),
                api.get("/events/venues")
            ]);
            setSlots(slotsRes.data.data);
            setCourses(coursesRes.data.data);
            setLecturers(usersRes.data.data);
            setVenues(venuesRes.data.data);
        } catch (err) {
            console.error("Failed to load timetable data:", err);
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            await fetchTimetableData();
            setLoading(false);
        };
        initLoad();
    }, []);

    // Create Timetable Slot Handler
    const handleCreateSlot = async (e) => {
        e.preventDefault();
        const { courseId, lecturerId, venueId, dayOfWeek, startTime, endTime, semester } = newSlot;
        if (!courseId || !lecturerId || !venueId || !startTime || !endTime) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await api.post("/timetables", newSlot);
            setMessage({ text: "Class schedule slot added successfully!", type: "success" });
            setNewSlot({
                courseId: "",
                lecturerId: "",
                venueId: "",
                dayOfWeek: "Monday",
                startTime: "",
                endTime: "",
                semester: "Semester I 2026"
            });
            setShowAddForm(false);
            fetchTimetableData();
        } catch (err) {
            console.error("Create timetable slot failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to add timetable slot.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Timetable Slot Handler
    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to delete this lecture slot?")) return;

        try {
            await api.delete(`/timetables/${slotId}`);
            setMessage({ text: "Timetable slot deleted successfully.", type: "success" });
            fetchTimetableData();
        } catch (err) {
            console.error("Delete slot failed:", err);
            alert("Failed to delete timetable slot.");
        }
    };

    const isSchedulerRole = user && ["admin", "hod"].includes(user.role);

    // Filter slots based on selected day filter
    const filteredSlots = dayFilter ? slots.filter(s => s.dayOfWeek === dayFilter) : slots;

    // Group slots by day of week for layout
    const daysOrder = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    if (loading && slots.length === 0) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="skeleton mt-8" style={{ height: "400px" }}></div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 font-heading">SVIAS Academic Timetable</h1>
                    <p className="text-gray-500 text-sm mt-1">Class timings, room venues, and instructor assignments for aesthetic study courses.</p>
                </div>
                {isSchedulerRole && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold shadow-md px-5"
                    >
                        {showAddForm ? "Close Scheduler Panel" : "Schedule Class Slot"}
                    </button>
                )}
            </div>

            {/* Alert Notification */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    {message.text}
                </div>
            )}

            {/* Add Timetable Slot Form Panel */}
            {showAddForm && isSchedulerRole && (
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-200 shadow-md mb-8 animate-slide-down max-w-3xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2">Schedule Class Registry</h3>
                    <form onSubmit={handleCreateSlot} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select Course</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newSlot.courseId}
                                    onChange={e => setNewSlot(prev => ({ ...prev, courseId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Course --</option>
                                    {courses.map(c => (
                                        <option key={c._id} value={c._id}>{c.code} - {c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Assign Instructor</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newSlot.lecturerId}
                                    onChange={e => setNewSlot(prev => ({ ...prev, lecturerId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Lecturer --</option>
                                    {lecturers.map(l => (
                                        <option key={l._id} value={l._id}>{l.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select Venue</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newSlot.venueId}
                                    onChange={e => setNewSlot(prev => ({ ...prev, venueId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Venue --</option>
                                    {venues.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Day of Week</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newSlot.dayOfWeek}
                                    onChange={e => setNewSlot(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                                    required
                                >
                                    {daysOrder.map(day => (
                                        <option key={day} value={day}>{day}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Semester</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newSlot.semester}
                                    onChange={e => setNewSlot(prev => ({ ...prev, semester: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Start Time (HH:MM)</label>
                                <input 
                                    type="time" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newSlot.startTime}
                                    onChange={e => setNewSlot(prev => ({ ...prev, startTime: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">End Time (HH:MM)</label>
                                <input 
                                    type="time" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newSlot.endTime}
                                    onChange={e => setNewSlot(prev => ({ ...prev, endTime: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-2">
                            <button 
                                type="button" 
                                onClick={() => setShowAddForm(false)}
                                className="btn btn-outline rounded-lg px-6 text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="btn btn-primary bg-red-700 text-white hover:bg-red-800 rounded-lg px-8 font-bold text-sm"
                            >
                                {actionLoading ? "Saving..." : "Add Lecture Slot"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filter controls */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex gap-2 overflow-x-auto mb-8 shadow-sm">
                <button 
                    onClick={() => setDayFilter("")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                        dayFilter === "" ? "bg-red-700 text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-100"
                    }`}
                >
                    Full Week
                </button>
                {daysOrder.map(day => (
                    <button 
                        key={day}
                        onClick={() => setDayFilter(day)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase transition whitespace-nowrap ${
                            dayFilter === day ? "bg-red-700 text-white shadow-sm" : "bg-white text-gray-600 border hover:bg-gray-100"
                        }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            {/* Timetable grid */}
            {filteredSlots.length === 0 ? (
                <div className="empty-state bg-white p-12 rounded-2xl border text-center">
                    <h3 className="font-bold text-gray-700">No scheduled lectures found</h3>
                    <p className="text-gray-400 text-sm mt-1 font-semibold">Verify filters or add class slots.</p>
                </div>
            ) : (
                <div className="flex flex-col gap-8">
                    {daysOrder
                        .filter(day => !dayFilter || day === dayFilter)
                        .map(day => {
                            const daySlots = filteredSlots.filter(s => s.dayOfWeek === day);
                            if (daySlots.length === 0) return null;

                            return (
                                <div key={day} className="bg-white border rounded-2xl p-6 shadow-sm">
                                    <h3 className="text-lg font-extrabold text-red-800 uppercase tracking-wide border-b pb-3 mb-4 font-heading">{day} Lecture Slots</h3>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {daySlots.map(slot => (
                                            <div key={slot._id} className="p-4 bg-gray-50 border border-gray-100 rounded-xl flex flex-col justify-between shadow-sm hover:border-red-200 transition">
                                                <div>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded">{slot.courseId.code}</span>
                                                        <span className="text-gray-500 font-bold text-xs">{slot.startTime} - {slot.endTime}</span>
                                                    </div>
                                                    <h4 className="font-bold text-gray-800 text-sm mt-1 leading-tight">{slot.courseId.name}</h4>
                                                    <div className="text-xs text-gray-400 font-bold mt-3 uppercase tracking-wide">Venue Location</div>
                                                    <div className="text-gray-700 text-xs font-semibold mt-1">{slot.venueId?.name} ({slot.venueId?.location || "N/A"})</div>
                                                    
                                                    <div className="text-xs text-gray-400 font-bold mt-3 uppercase tracking-wide">Assigned Instructor</div>
                                                    <div className="text-gray-700 text-xs font-semibold mt-1">{slot.lecturerId?.name}</div>
                                                </div>

                                                {isSchedulerRole && (
                                                    <div className="flex justify-end pt-3 border-t mt-4">
                                                        <button 
                                                            onClick={() => handleDeleteSlot(slot._id)}
                                                            className="text-red-700 hover:text-red-950 font-bold text-xs border border-red-100 hover:bg-red-50 px-3 py-1.5 rounded-lg"
                                                        >
                                                            Cancel Class
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
};

export default TimetablePage;

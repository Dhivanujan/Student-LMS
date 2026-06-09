import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const EventsPage = () => {
    const { user } = useContext(AuthContext);
    const [events, setEvents] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    
    // New Event Form State
    const [newEvent, setNewEvent] = useState({
        title: "",
        description: "",
        date: "",
        venueId: "",
        type: "performance",
        maxParticipants: 100
    });

    const [message, setMessage] = useState({ text: "", type: "" });

    const fetchEventsAndVenues = async () => {
        try {
            const [eventsRes, venuesRes] = await Promise.all([
                api.get("/events"),
                api.get("/events/venues")
            ]);
            setEvents(eventsRes.data.data);
            setVenues(venuesRes.data.data);
        } catch (err) {
            console.error("Failed to load events/venues:", err);
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            await fetchEventsAndVenues();
            setLoading(false);
        };
        initLoad();
    }, []);

    // Create Event Handler
    const handleCreateEvent = async (e) => {
        e.preventDefault();
        if (!newEvent.title || !newEvent.date || !newEvent.venueId) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            await api.post("/events", newEvent);
            setMessage({ text: "Event scheduled successfully!", type: "success" });
            setNewEvent({
                title: "",
                description: "",
                date: "",
                venueId: "",
                type: "performance",
                maxParticipants: 100
            });
            setShowAddForm(false);
            fetchEventsAndVenues();
        } catch (err) {
            console.error("Create event failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to schedule event.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Register Participant Handler
    const handleRegister = async (eventId) => {
        setActionLoading(true);
        try {
            await api.post(`/events/${eventId}/register`);
            setMessage({ text: "Registration confirmed! See you there.", type: "success" });
            fetchEventsAndVenues();
        } catch (err) {
            console.error("Register failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to register.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Cancel Event Handler
    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm("Are you sure you want to cancel this event?")) return;

        try {
            await api.delete(`/events/${eventId}`);
            setMessage({ text: "Event cancelled successfully.", type: "success" });
            fetchEventsAndVenues();
        } catch (err) {
            console.error("Delete event failed:", err);
            alert("Failed to cancel event.");
        }
    };

    const isOrganizerRole = user && ["admin", "hod", "lecturer"].includes(user.role);

    if (loading && events.length === 0) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="grid-courses mt-8">
                    {[1, 2].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "220px" }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 font-heading">SVIAS Events & Performance Schedules</h1>
                    <p className="text-gray-500 text-sm mt-1">Calendar of cultural concerts, dance recitals, drama performances, and fine arts exhibitions.</p>
                </div>
                {isOrganizerRole && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold shadow-md px-5"
                    >
                        {showAddForm ? "Close Planner" : "Schedule Cultural Event"}
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

            {/* Create Event Panel */}
            {showAddForm && isOrganizerRole && (
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-200 shadow-md mb-8 animate-slide-down max-w-3xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2">Event Scheduling Panel</h3>
                    <form onSubmit={handleCreateEvent} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Event Title</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    placeholder="e.g. Navarathiri Sangeetha Vizha"
                                    value={newEvent.title}
                                    onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Date & Time</label>
                                <input 
                                    type="datetime-local" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newEvent.date}
                                    onChange={e => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Select Venue</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newEvent.venueId}
                                    onChange={e => setNewEvent(prev => ({ ...prev, venueId: e.target.value }))}
                                    required
                                >
                                    <option value="">-- Choose Venue --</option>
                                    {venues.map(v => (
                                        <option key={v._id} value={v._id}>{v.name} ({v.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Event Type</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newEvent.type}
                                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                                    required
                                >
                                    <option value="performance">Music / Dance Recital</option>
                                    <option value="exhibition">Art Exhibition</option>
                                    <option value="workshop">Academic Workshop</option>
                                    <option value="seminar">Seminar / Lecture</option>
                                    <option value="other">Other Cultural Event</option>
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Max Participants</label>
                                <input 
                                    type="number" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newEvent.maxParticipants}
                                    onChange={e => setNewEvent(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Event Description</label>
                            <textarea 
                                className="form-input rounded-lg border-gray-200 text-sm p-2 h-20"
                                placeholder="Describe the program details, participating students, guest speakers..."
                                value={newEvent.description}
                                onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                                required
                            />
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
                                {actionLoading ? "Scheduling..." : "Publish Event Schedule"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Events Listing */}
            {events.length === 0 ? (
                <div className="empty-state bg-white p-12 rounded-2xl border text-center">
                    <h3 className="font-bold text-gray-700">No scheduled events</h3>
                    <p className="text-gray-400 text-sm mt-1 font-semibold">Check back later for upcoming exhibitions or concerts.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {events.map(ev => {
                        const isRegistered = user && ev.participants.some(p => p._id === user.id || p === user.id);
                        const isFull = ev.maxParticipants && ev.participants.length >= ev.maxParticipants;
                        const eventDate = new Date(ev.date);

                        return (
                            <div key={ev._id} className="stat-card bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start gap-2 mb-3">
                                        <h3 className="font-bold text-gray-800 text-lg leading-snug">{ev.title}</h3>
                                        <span className="text-xs font-extrabold text-red-700 bg-red-50 px-2.5 py-0.5 rounded uppercase tracking-wider whitespace-nowrap">{ev.type}</span>
                                    </div>
                                    <div className="text-xs text-gray-400 font-bold mb-4 flex flex-wrap gap-x-4 gap-y-1">
                                        <span>📅 {eventDate.toLocaleDateString()} at {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        <span>🏛️ Venue: {ev.venueId?.name}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{ev.description}</p>
                                    
                                    <div className="flex items-center gap-4 text-xs font-semibold text-gray-500 bg-gray-50 p-3 rounded-xl border mb-4">
                                        <div className="flex-1">
                                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Registered Bookings</span>
                                            <span className="text-sm font-extrabold text-gray-800 mt-1 block">
                                                {ev.participants.length} {ev.maxParticipants && `/ ${ev.maxParticipants}`} participants
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-gray-400 font-bold uppercase tracking-wider block text-[10px]">Organized By</span>
                                            <span className="text-sm font-extrabold text-gray-800 mt-1 block">
                                                {ev.organizerId?.name || "SVIAS Faculty"}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 pt-2 border-t mt-2">
                                    {isRegistered ? (
                                        <button disabled className="btn btn-outline border-emerald-500 text-emerald-600 cursor-not-allowed bg-emerald-50/20 rounded-xl text-xs font-bold py-2.5 flex-1">
                                            Registered ✅
                                        </button>
                                    ) : isFull ? (
                                        <button disabled className="btn btn-outline border-gray-300 text-gray-400 cursor-not-allowed rounded-xl text-xs font-bold py-2.5 flex-1">
                                            Fully Booked 🚫
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => handleRegister(ev._id)}
                                            disabled={actionLoading}
                                            className="btn btn-primary text-white bg-red-700 hover:bg-red-800 rounded-xl text-xs font-bold py-2.5 flex-1"
                                        >
                                            Register to Attend
                                        </button>
                                    )}

                                    {isOrganizerRole && (
                                        <button 
                                            onClick={() => handleDeleteEvent(ev._id)}
                                            className="text-red-700 hover:text-red-950 font-bold border border-red-100 hover:bg-red-50 p-2.5 rounded-xl text-xs"
                                        >
                                            Cancel Event
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default EventsPage;

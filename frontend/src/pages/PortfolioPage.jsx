import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const PortfolioPage = () => {
    const { user } = useContext(AuthContext);
    const [portfolios, setPortfolios] = useState([]);
    const [selectedPortfolio, setSelectedPortfolio] = useState(null); // { portfolio, items }
    const [myPortfolio, setMyPortfolio] = useState(null); // { portfolio, items }
    
    // Filters
    const [category, setCategory] = useState("");
    const [search, setSearch] = useState("");

    // Tabs
    const [activeTab, setActiveTab] = useState("gallery"); // gallery, my-portfolio

    // Edit Portfolio Form
    const [editBio, setEditBio] = useState("");
    const [editSkills, setEditSkills] = useState("");
    const [featuredFile, setFeaturedFile] = useState(null);

    // Add Item Form
    const [newItem, setNewItem] = useState({
        title: "",
        description: "",
        type: "image",
        category: "General",
        fileUrl: ""
    });
    const [itemFile, setItemFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const fetchPortfolios = async () => {
        try {
            const res = await api.get(`/portfolios?category=${category}&search=${search}`);
            setPortfolios(res.data.data);
        } catch (err) {
            console.error("Failed to load portfolios:", err);
        }
    };

    const fetchMyPortfolio = async () => {
        if (user && user.role === "student") {
            try {
                const res = await api.get("/portfolios/me");
                setMyPortfolio(res.data.data);
                setEditBio(res.data.data.portfolio.bio || "");
                setEditSkills(res.data.data.portfolio.skills?.join(", ") || "");
            } catch (err) {
                console.error("Failed to load personal portfolio:", err);
            }
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            await Promise.all([fetchPortfolios(), fetchMyPortfolio()]);
            setLoading(false);
        };
        initLoad();
    }, [category, search]);

    // View student details
    const viewStudentPortfolio = async (studentId) => {
        setLoading(true);
        try {
            const res = await api.get(`/portfolios/student/${studentId}`);
            setSelectedPortfolio(res.data.data);
        } catch (err) {
            console.error("Failed to load student portfolio:", err);
            alert("Failed to load portfolio details.");
        } finally {
            setLoading(false);
        }
    };

    // Save Portfolio profile changes
    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const formData = new FormData();
            formData.append("bio", editBio);
            formData.append("skills", editSkills);
            if (featuredFile) {
                formData.append("featuredImage", featuredFile);
            }

            await api.put("/portfolios/me", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage({ text: "Portfolio profile updated successfully!", type: "success" });
            fetchMyPortfolio();
            fetchPortfolios();
        } catch (err) {
            console.error("Profile save failed:", err);
            setMessage({ text: "Failed to update profile.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Add portfolio item
    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItem.title) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const formData = new FormData();
            formData.append("title", newItem.title);
            formData.append("description", newItem.description);
            formData.append("type", newItem.type);
            formData.append("category", newItem.category);
            
            if (itemFile) {
                formData.append("file", itemFile);
            } else if (newItem.fileUrl) {
                formData.append("fileUrl", newItem.fileUrl);
            } else {
                setMessage({ text: "Please select a file to upload or paste a link.", type: "error" });
                setActionLoading(false);
                return;
            }

            await api.post("/portfolios/items", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage({ text: "Portfolio item added successfully!", type: "success" });
            setNewItem({ title: "", description: "", type: "image", category: "General", fileUrl: "" });
            setItemFile(null);
            fetchMyPortfolio();
        } catch (err) {
            console.error("Add item failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to add portfolio item.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Delete portfolio item
    const handleDeleteItem = async (itemId) => {
        if (!window.confirm("Are you sure you want to remove this item?")) return;

        try {
            await api.delete(`/portfolios/items/${itemId}`);
            fetchMyPortfolio();
            setMessage({ text: "Portfolio item deleted.", type: "success" });
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete item.");
        }
    };

    if (loading && portfolios.length === 0) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="grid-courses mt-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "250px" }}></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-fade-in p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-800 font-heading">Student Creative Portfolios</h1>
                    <p className="text-gray-500 text-sm mt-1">Explore paintings, music, dance recitals, and theatrical projects by SVIAS students.</p>
                </div>
                {user?.role === "student" && (
                    <div className="flex bg-gray-100 p-1 rounded-xl border">
                        <button 
                            onClick={() => { setActiveTab("gallery"); setSelectedPortfolio(null); }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                activeTab === "gallery" ? "bg-white text-red-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            Showcase Gallery
                        </button>
                        <button 
                            onClick={() => { setActiveTab("my-portfolio"); setSelectedPortfolio(null); }}
                            className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition ${
                                activeTab === "my-portfolio" ? "bg-white text-red-700 shadow-sm" : "text-gray-500 hover:text-gray-800"
                            }`}
                        >
                            My Portfolio Profile
                        </button>
                    </div>
                )}
            </div>

            {/* Alert Message */}
            {message.text && (
                <div className={`p-4 mb-6 rounded-xl border text-sm font-semibold flex items-center gap-2 ${
                    message.type === "success" ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
                }`}>
                    {message.text}
                </div>
            )}

            {/* Gallery View */}
            {activeTab === "gallery" && !selectedPortfolio && (
                <div>
                    {/* Filters */}
                    <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8 shadow-sm">
                        <div className="flex-1">
                            <input 
                                type="text"
                                className="form-input rounded-xl border-gray-200 bg-white"
                                placeholder="Search students by name..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="w-full sm:w-64">
                            <select 
                                className="form-input rounded-xl border-gray-200 bg-white"
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                            >
                                <option value="">-- All Departments --</option>
                                <option value="Music">Department of Music</option>
                                <option value="Dance">Department of Dance</option>
                                <option value="Drama & Theatre">Department of Drama & Theatre</option>
                                <option value="Visual & Technological Arts">Department of Visual Arts</option>
                            </select>
                        </div>
                    </div>

                    {/* Portfolios Grid */}
                    {portfolios.length === 0 ? (
                        <div className="empty-state bg-white p-12 rounded-2xl border text-center">
                            <h3 className="font-bold text-gray-700">No portfolios found</h3>
                            <p className="text-gray-400 text-sm mt-1">Try relaxing your search terms or filters.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {portfolios.map(p => (
                                <div key={p._id} className="stat-card bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-4">
                                            {p.studentId?.profilePicture ? (
                                                <img 
                                                    src={`http://localhost:5000${p.studentId.profilePicture}`} 
                                                    alt={p.studentId.name} 
                                                    className="w-12 h-12 rounded-full object-cover border-2 border-red-50"
                                                />
                                            ) : (
                                                <div className="w-12 h-12 rounded-full bg-red-700 text-white font-bold text-lg flex items-center justify-center">
                                                    {p.studentId?.name?.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <div>
                                                <div className="font-bold text-gray-800 text-base">{p.studentId?.name || "Aesthetic Student"}</div>
                                                <div className="text-xs text-red-700 font-semibold uppercase">{p.category}</div>
                                            </div>
                                        </div>
                                        <p className="text-gray-500 text-sm leading-relaxed mb-4 line-clamp-3">{p.bio || "No biography provided yet."}</p>
                                        <div className="flex flex-wrap gap-1.5 mb-4">
                                            {p.skills.slice(0, 3).map((s, idx) => (
                                                <span key={idx} className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded font-semibold">{s}</span>
                                            ))}
                                            {p.skills.length > 3 && (
                                                <span className="text-xs text-gray-400 self-center">+{p.skills.length - 3} more</span>
                                            )}
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => viewStudentPortfolio(p.studentId._id || p.studentId)}
                                        className="btn btn-outline btn-sm w-full font-bold border-red-700 text-red-700 hover:bg-red-50 rounded-xl"
                                    >
                                        View Creative Portfolio
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Individual Student Showcase Detail */}
            {selectedPortfolio && (
                <div className="bg-white border p-8 rounded-2xl shadow-lg animate-slide-up">
                    <button 
                        onClick={() => setSelectedPortfolio(null)}
                        className="text-red-700 hover:text-red-800 font-bold mb-6 text-sm flex items-center gap-1.5"
                    >
                        &larr; Back to Showcase Gallery
                    </button>

                    <div className="flex flex-col md:flex-row gap-8 border-b pb-6 mb-8">
                        {selectedPortfolio.portfolio.studentId?.profilePicture ? (
                            <img 
                                src={`http://localhost:5000${selectedPortfolio.portfolio.studentId.profilePicture}`} 
                                alt={selectedPortfolio.portfolio.studentId.name} 
                                className="w-24 h-24 rounded-full object-cover border-4 border-red-50"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-full bg-red-700 text-white font-extrabold text-3xl flex items-center justify-center">
                                {selectedPortfolio.portfolio.studentId?.name?.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <h2 className="text-2xl font-extrabold text-gray-800 font-heading">{selectedPortfolio.portfolio.studentId.name}</h2>
                            <span className="badge badge-info mt-1.5 uppercase text-xs tracking-wider">{selectedPortfolio.portfolio.category} student</span>
                            <p className="text-gray-600 text-sm mt-3 leading-relaxed max-w-xl">{selectedPortfolio.portfolio.bio}</p>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {selectedPortfolio.portfolio.skills.map((s, idx) => (
                                    <span key={idx} className="bg-red-50 text-red-700 border border-red-100 text-xs px-2.5 py-0.5 rounded-full font-bold">{s}</span>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Portfolio Items Gallery */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-6 font-heading border-b pb-2">Uploaded Performances & Creative Work</h3>
                        {selectedPortfolio.items.length === 0 ? (
                            <p className="text-gray-400 italic text-sm text-center py-6">No pieces uploaded to this showcase yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {selectedPortfolio.items.map(item => (
                                    <div key={item._id} className="border border-gray-100 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition bg-gray-50 flex flex-col justify-between">
                                        <div className="p-4">
                                            <div className="flex justify-between items-start mb-2">
                                                <div className="font-bold text-gray-800">{item.title}</div>
                                                <span className="bg-gray-200 text-gray-600 text-[10px] uppercase px-2 py-0.5 rounded font-extrabold">{item.type}</span>
                                            </div>
                                            <p className="text-gray-500 text-xs leading-relaxed mb-4">{item.description}</p>
                                        </div>

                                        {/* Render Content Media */}
                                        <div className="border-t bg-white p-3 flex justify-center min-h-[140px] items-center">
                                            {item.type === "image" && (
                                                <img 
                                                    src={`http://localhost:5000${item.fileUrl}`} 
                                                    alt={item.title} 
                                                    className="max-h-36 object-contain rounded"
                                                />
                                            )}
                                            {item.type === "audio" && (
                                                <audio controls src={`http://localhost:5000${item.fileUrl}`} className="w-full mt-2" />
                                            )}
                                            {item.type === "video" && (
                                                <video controls src={`http://localhost:5000${item.fileUrl}`} className="max-h-36 w-full object-contain rounded" />
                                            )}
                                            {item.type === "document" && (
                                                <a 
                                                    href={`http://localhost:5000${item.fileUrl}`} 
                                                    target="_blank" 
                                                    rel="noreferrer"
                                                    className="btn btn-outline btn-sm text-xs border-red-700 text-red-700 hover:bg-red-50"
                                                >
                                                    Open / Download Script
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Manage My Portfolio (Student Portal) */}
            {activeTab === "my-portfolio" && myPortfolio && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Edit Bio and Skills */}
                    <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-base font-bold text-gray-800 mb-4 font-heading border-b pb-2">Portfolio Settings</h3>
                            <form onSubmit={handleSaveProfile} className="flex flex-col gap-3">
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">My Biography</label>
                                    <textarea 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-gray-50 focus:bg-white h-24"
                                        placeholder="Share your creative background, departments, performance goals..."
                                        value={editBio}
                                        onChange={e => setEditBio(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Skills (Comma-separated)</label>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-gray-50 focus:bg-white"
                                        placeholder="e.g. Vocalist, Veena Player, Painting"
                                        value={editSkills}
                                        onChange={e => setEditSkills(e.target.value)}
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    disabled={actionLoading}
                                    className="btn btn-primary bg-red-700 text-white hover:bg-red-800 rounded-lg p-2 font-bold text-sm w-full mt-2"
                                >
                                    {actionLoading ? "Saving..." : "Save Profile Details"}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Upload Portfolio Items */}
                    <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-4 font-heading border-b pb-2">Upload Creative Work</h3>
                        <form onSubmit={handleAddItem} className="flex flex-col gap-3">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Piece Title</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    placeholder="e.g. Bharatanatyam Varnam Recital"
                                    value={newItem.title}
                                    onChange={e => setNewItem(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Description</label>
                                <textarea 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 h-16"
                                    placeholder="Add context, medium used, or raga structures..."
                                    value={newItem.description}
                                    onChange={e => setNewItem(prev => ({ ...prev, description: e.target.value }))}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Media Type</label>
                                    <select 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                        value={newItem.type}
                                        onChange={e => setNewItem(prev => ({ ...prev, type: e.target.value }))}
                                        required
                                    >
                                        <option value="image">Image (Artworks)</option>
                                        <option value="audio">Audio (Music)</option>
                                        <option value="video">Video (Performances)</option>
                                        <option value="document">Document (Scripts)</option>
                                    </select>
                                </div>
                                <div className="form-group flex flex-col gap-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase">Sub-Category</label>
                                    <input 
                                        type="text" 
                                        className="form-input rounded-lg border-gray-200 text-sm p-2"
                                        placeholder="e.g. Painting, Recital"
                                        value={newItem.category}
                                        onChange={e => setNewItem(prev => ({ ...prev, category: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Upload Media File</label>
                                <input 
                                    type="file" 
                                    className="form-input rounded-lg border-gray-200 text-xs p-1 bg-white"
                                    onChange={e => setItemFile(e.target.files[0])}
                                />
                                <span className="text-[10px] text-gray-400">Supports JPG, PNG, MP3, WAV, MP4 (max 50MB)</span>
                            </div>
                            <button 
                                type="submit" 
                                disabled={actionLoading}
                                className="btn btn-primary bg-red-700 text-white hover:bg-red-800 rounded-lg p-2 font-bold text-sm w-full mt-2"
                            >
                                {actionLoading ? "Uploading..." : "Publish Creative Piece"}
                            </button>
                        </form>
                    </div>

                    {/* Manage uploaded items */}
                    <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                        <h3 className="text-base font-bold text-gray-800 mb-4 font-heading border-b pb-2">My Uploaded Pieces ({myPortfolio.items.length})</h3>
                        {myPortfolio.items.length === 0 ? (
                            <p className="text-gray-400 italic text-sm text-center py-6">You haven't uploaded any pieces yet.</p>
                        ) : (
                            <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto">
                                {myPortfolio.items.map(item => (
                                    <div key={item._id} className="p-3 bg-gray-50 border border-gray-100 rounded-xl flex justify-between items-center text-xs shadow-sm">
                                        <div>
                                            <div className="font-bold text-gray-800">{item.title}</div>
                                            <div className="text-gray-400 mt-1 uppercase text-[9px] font-extrabold">{item.type} | {item.category}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteItem(item._id)}
                                            className="text-red-700 hover:text-red-900 font-bold border border-red-200 hover:bg-red-50 p-1.5 rounded-lg"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PortfolioPage;

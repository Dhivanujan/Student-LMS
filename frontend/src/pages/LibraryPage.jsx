import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

const LibraryPage = () => {
    const { user } = useContext(AuthContext);
    const [resources, setResources] = useState([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [type, setType] = useState("");
    
    // Add Resource Form State
    const [newRes, setNewRes] = useState({
        title: "",
        author: "",
        category: "Music",
        type: "book",
        description: "",
        isbn: "",
        publishedYear: new Date().getFullYear(),
        fileUrl: ""
    });
    const [resFile, setResFile] = useState(null);

    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [showAddForm, setShowAddForm] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    const fetchLibraryResources = async () => {
        try {
            const res = await api.get(`/library?search=${search}&category=${category}&type=${type}`);
            setResources(res.data.data);
        } catch (err) {
            console.error("Failed to load library resources:", err);
        }
    };

    useEffect(() => {
        const initLoad = async () => {
            setLoading(true);
            await fetchLibraryResources();
            setLoading(false);
        };
        initLoad();
    }, [category, type, search]);

    // Add Resource Handler
    const handleAddResource = async (e) => {
        e.preventDefault();
        if (!newRes.title || !newRes.author) return;

        setActionLoading(true);
        setMessage({ text: "", type: "" });

        try {
            const formData = new FormData();
            formData.append("title", newRes.title);
            formData.append("author", newRes.author);
            formData.append("category", newRes.category);
            formData.append("type", newRes.type);
            formData.append("description", newRes.description);
            formData.append("isbn", newRes.isbn);
            formData.append("publishedYear", newRes.publishedYear);

            if (resFile) {
                formData.append("file", resFile);
            } else if (newRes.fileUrl) {
                formData.append("fileUrl", newRes.fileUrl);
            } else {
                setMessage({ text: "Please upload a resource file or provide a URL.", type: "error" });
                setActionLoading(false);
                return;
            }

            await api.post("/library", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage({ text: "Resource added to Digital Library catalog!", type: "success" });
            setNewRes({
                title: "",
                author: "",
                category: "Music",
                type: "book",
                description: "",
                isbn: "",
                publishedYear: new Date().getFullYear(),
                fileUrl: ""
            });
            setResFile(null);
            setShowAddForm(false);
            fetchLibraryResources();
        } catch (err) {
            console.error("Add resource failed:", err);
            setMessage({ text: err.response?.data?.message || "Failed to add resource.", type: "error" });
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Resource Handler
    const handleDeleteResource = async (resourceId) => {
        if (!window.confirm("Are you sure you want to remove this resource from the catalog?")) return;

        try {
            await api.delete(`/library/${resourceId}`);
            setMessage({ text: "Catalog item removed successfully.", type: "success" });
            fetchLibraryResources();
        } catch (err) {
            console.error("Delete resource failed:", err);
            alert("Failed to delete catalog item.");
        }
    };

    const isLibrarianRole = user && ["admin", "hod", "lecturer"].includes(user.role);

    if (loading && resources.length === 0) {
        return (
            <div className="p-6">
                <div className="skeleton skeleton-text" style={{ width: "300px", height: "2.5rem" }}></div>
                <div className="grid-courses mt-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="stat-card skeleton-card" style={{ height: "200px" }}></div>
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
                    <h1 className="text-3xl font-extrabold text-gray-800 font-heading">Digital Library & Archives</h1>
                    <p className="text-gray-500 text-sm mt-1">SVIAS repository of e-books, research materials, and past exam papers.</p>
                </div>
                {isLibrarianRole && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className="btn btn-primary bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold shadow-md px-5"
                    >
                        {showAddForm ? "Close Catalog Panel" : "Add Digital Resource"}
                    </button>
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

            {/* Add Catalog Item Form Panel */}
            {showAddForm && isLibrarianRole && (
                <div className="glass-card-static bg-white p-6 rounded-2xl border border-gray-200 shadow-md mb-8 animate-slide-down max-w-3xl">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 font-heading border-b pb-2">Catalog Resource Registry</h3>
                    <form onSubmit={handleAddResource} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Resource Title</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    placeholder="e.g. Carnatic Theory & Scales"
                                    value={newRes.title}
                                    onChange={e => setNewRes(prev => ({ ...prev, title: e.target.value }))}
                                    required
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Author / Department</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    placeholder="e.g. Dr. Ravichandra"
                                    value={newRes.author}
                                    onChange={e => setNewRes(prev => ({ ...prev, author: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Category</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newRes.category}
                                    onChange={e => setNewRes(prev => ({ ...prev, category: e.target.value }))}
                                    required
                                >
                                    <option value="Music">Music</option>
                                    <option value="Dance">Dance</option>
                                    <option value="Drama & Theatre">Drama & Theatre</option>
                                    <option value="Visual & Technological Arts">Visual Arts</option>
                                    <option value="General Academic">General Academic</option>
                                    <option value="Past Papers">Past Papers</option>
                                    <option value="Research Materials">Research Materials</option>
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Resource Type</label>
                                <select 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2 bg-white"
                                    value={newRes.type}
                                    onChange={e => setNewRes(prev => ({ ...prev, type: e.target.value }))}
                                    required
                                >
                                    <option value="book">E-Book</option>
                                    <option value="past_paper">Past Examination Paper</option>
                                    <option value="research_paper">Research Paper / Article</option>
                                </select>
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Published Year</label>
                                <input 
                                    type="number" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    value={newRes.publishedYear}
                                    onChange={e => setNewRes(prev => ({ ...prev, publishedYear: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">ISBN (If applicable)</label>
                                <input 
                                    type="text" 
                                    className="form-input rounded-lg border-gray-200 text-sm p-2"
                                    placeholder="e.g. 978-955-442-x"
                                    value={newRes.isbn}
                                    onChange={e => setNewRes(prev => ({ ...prev, isbn: e.target.value }))}
                                />
                            </div>
                            <div className="form-group flex flex-col gap-1">
                                <label className="text-xs font-bold text-gray-500 uppercase">Upload PDF File</label>
                                <input 
                                    type="file" 
                                    className="form-input rounded-lg border-gray-200 text-xs p-1 bg-white"
                                    onChange={e => setResFile(e.target.files[0])}
                                />
                            </div>
                        </div>

                        <div className="form-group flex flex-col gap-1">
                            <label className="text-xs font-bold text-gray-500 uppercase">Description / Abstract</label>
                            <textarea 
                                className="form-input rounded-lg border-gray-200 text-sm p-2 h-16"
                                placeholder="Summary of the book, topic syllabus, or research abstracts..."
                                value={newRes.description}
                                onChange={e => setNewRes(prev => ({ ...prev, description: e.target.value }))}
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
                                {actionLoading ? "Registering..." : "Add to Library Catalog"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Filters Bar */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 flex flex-col sm:flex-row gap-4 mb-8 shadow-sm">
                <div className="flex-1">
                    <input 
                        type="text"
                        className="form-input rounded-xl border-gray-200 bg-white"
                        placeholder="Search books, author, keywords..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="w-full sm:w-48">
                    <select 
                        className="form-input rounded-xl border-gray-200 bg-white"
                        value={category}
                        onChange={e => setCategory(e.target.value)}
                    >
                        <option value="">-- All Categories --</option>
                        <option value="Music">Music</option>
                        <option value="Dance">Dance</option>
                        <option value="Drama & Theatre">Drama & Theatre</option>
                        <option value="Visual & Technological Arts">Visual Arts</option>
                        <option value="General Academic">General Academic</option>
                        <option value="Past Papers">Past Papers</option>
                        <option value="Research Materials">Research Materials</option>
                    </select>
                </div>
                <div className="w-full sm:w-48">
                    <select 
                        className="form-input rounded-xl border-gray-200 bg-white"
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        <option value="">-- All Asset Types --</option>
                        <option value="book">E-Books</option>
                        <option value="past_paper">Past Papers</option>
                        <option value="research_paper">Research Papers</option>
                    </select>
                </div>
            </div>

            {/* Catalog Grid */}
            {resources.length === 0 ? (
                <div className="empty-state bg-white p-12 rounded-2xl border text-center">
                    <h3 className="font-bold text-gray-700">No resources found in the catalog</h3>
                    <p className="text-gray-400 text-sm mt-1">Try relaxing your search terms or filter constraints.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {resources.map(res => (
                        <div key={res._id} className="stat-card bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg transition flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-xs font-extrabold text-red-700 bg-red-50 px-2 py-0.5 rounded tracking-wide uppercase">{res.category}</span>
                                    <span className="bg-gray-100 text-gray-500 text-[9px] uppercase px-2 py-0.5 rounded font-extrabold">{res.type}</span>
                                </div>
                                <h3 className="font-bold text-gray-800 text-lg leading-tight mt-1 mb-2">{res.title}</h3>
                                <div className="text-xs text-gray-500 mb-3 font-semibold">By {res.author} {res.publishedYear && `| Published: ${res.publishedYear}`}</div>
                                <p className="text-gray-500 text-xs leading-relaxed mb-4 line-clamp-3">{res.description || "No abstract details available."}</p>
                                {res.isbn && (
                                    <div className="text-[10px] text-gray-400 font-bold mb-4">ISBN: {res.isbn}</div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                                {res.fileUrl ? (
                                    <a 
                                        href={res.fileUrl.startsWith("http") ? res.fileUrl : `http://localhost:5000${res.fileUrl}`}
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="btn btn-primary text-white bg-red-700 hover:bg-red-800 rounded-xl text-xs font-bold px-4 py-2 flex-1 text-center"
                                    >
                                        Read / Download PDF
                                    </a>
                                ) : (
                                    <span className="text-gray-400 italic text-xs flex-1">File Unavailable</span>
                                )}
                                {isLibrarianRole && (
                                    <button 
                                        onClick={() => handleDeleteResource(res._id)}
                                        className="text-red-700 hover:text-red-950 font-bold border border-red-100 hover:bg-red-50 p-2 rounded-xl text-xs"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LibraryPage;

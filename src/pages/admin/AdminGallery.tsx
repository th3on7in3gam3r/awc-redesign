import { useState, useEffect, FC, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Plus, Image as ImageIcon, Film, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface GalleryItem {
    id: string;
    title: string;
    category: string;
    type: 'image' | 'video';
    url: string;
    thumbnail?: string;
    description: string;
}

const AdminGallery: FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

    // Form State
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('General');
    const [type, setType] = useState<'image' | 'video'>('image');
    const [description, setDescription] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const API_URL = '/api/gallery';

    useEffect(() => {
        fetchItems();
    }, []);

    const fetchItems = async () => {
        try {
            const res = await fetch(API_URL);
            const data = await res.json();
            setItems(data);
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: FormEvent) => {
        e.preventDefault();
        if (!file && type === 'image') return;

        setIsUploading(true);
        setStatus(null);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('category', category);
        formData.append('type', type);
        formData.append('description', description);
        if (type === 'video' && videoUrl) formData.append('url', videoUrl);
        if (file) formData.append('media', file);

        try {
            const res = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            setStatus({ type: 'success', message: 'Media added to gallery successfully!' });
            setTitle('');
            setDescription('');
            setFile(null);
            fetchItems();
        } catch (err) {
            setStatus({ type: 'error', message: 'Failed to upload media. Please try again.' });
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.ok) {
                setItems(items.filter(item => item.id !== id));
            }
        } catch (err) {
            console.error('Delete error:', err);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-church-burgundy uppercase tracking-tighter serif mb-2">
                            Gallery <span className="text-church-gold">Management</span>
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">Manage your church's visual presence and memories.</p>
                    </div>

                    <div className="flex items-center gap-4 bg-white p-2 rounded-2xl border border-slate-100 shadow-sm w-fit">
                        <div className="px-4 py-2 bg-church-burgundy/5 rounded-xl">
                            <span className="text-church-burgundy text-[10px] font-black uppercase tracking-widest">{items.length} Total Items</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Upload Section */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100 sticky top-32"
                        >
                            <h2 className="text-xl font-black text-church-burgundy serif mb-8 uppercase tracking-tight flex items-center gap-3">
                                <Plus size={20} className="text-church-gold" />
                                Add New Media
                            </h2>

                            <form onSubmit={handleUpload} className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Title</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-church-burgundy/20 focus:border-church-burgundy transition-all"
                                        placeholder="Sermon highlights..."
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Category</label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-church-burgundy/20 focus:border-church-burgundy transition-all"
                                    >
                                        <option>Worship</option>
                                        <option>Ministries</option>
                                        <option>Youth</option>
                                        <option>Community</option>
                                        <option>Children</option>
                                        <option>General</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Type</label>
                                    <div className="flex gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setType('image')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === 'image' ? 'bg-church-burgundy text-white border-church-burgundy' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            <ImageIcon size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Image</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setType('video')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${type === 'video' ? 'bg-church-burgundy text-white border-church-burgundy' : 'bg-slate-50 border-slate-100 text-slate-400'}`}
                                        >
                                            <Film size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Video</span>
                                        </button>
                                    </div>
                                </div>

                                {type === 'image' ? (
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="hidden"
                                            id="gallery-file"
                                            accept="image/*"
                                        />
                                        <label
                                            htmlFor="gallery-file"
                                            className="flex flex-col items-center justify-center w-full h-40 bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl cursor-pointer hover:bg-slate-100/50 hover:border-church-burgundy/30 transition-all p-6 text-center"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 text-slate-400 group-hover:text-church-burgundy group-hover:scale-110 transition-all">
                                                <Upload size={20} />
                                            </div>
                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                                {file ? file.name : "Choose Media File"}
                                            </p>
                                        </label>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">YouTube URL</label>
                                        <input
                                            type="url"
                                            value={videoUrl}
                                            onChange={(e) => setVideoUrl(e.target.value)}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-church-burgundy/20"
                                            placeholder="https://youtube.com/..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 ml-1">Description</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-church-burgundy/20 min-h-[100px]"
                                        placeholder="A brief description of this moment..."
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isUploading}
                                    className="w-full py-5 bg-church-burgundy text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-lg hover:shadow-xl hover:bg-church-gold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                                >
                                    {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Plus size={18} />}
                                    {isUploading ? "Uploading..." : "Add to Gallery"}
                                </button>

                                <AnimatePresence>
                                    {status && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}
                                        >
                                            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                            <span className="text-[10px] font-black uppercase tracking-widest">{status.message}</span>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </form>
                        </motion.div>
                    </div>

                    {/* Listings Section */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-premium border border-slate-100">
                            <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                                <h2 className="text-xl font-black text-church-burgundy serif uppercase tracking-tight">Active Gallery</h2>
                            </div>

                            <div className="p-8">
                                {isLoading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                        <Loader2 className="animate-spin mb-4" size={40} />
                                        <p className="text-xs font-black uppercase tracking-widest">Loading Media Hub...</p>
                                    </div>
                                ) : items.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                                        <ImageIcon size={60} className="mb-6 opacity-20" />
                                        <p className="text-xs font-black uppercase tracking-widest">No items found in gallery</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <AnimatePresence>
                                            {items.map((item) => (
                                                <motion.div
                                                    key={item.id}
                                                    layout
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="group bg-slate-50 rounded-3xl p-4 border border-slate-100 flex gap-4 transition-all hover:shadow-md hover:bg-white"
                                                >
                                                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 relative">
                                                        <img src={item.type === 'video' ? (item.thumbnail || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80') : item.url} alt={item.title} className="w-full h-full object-cover" />
                                                        {item.type === 'video' && (
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white">
                                                                <Film size={16} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                                                        <div>
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-church-burgundy text-[8px] font-black uppercase tracking-[0.2em]">{item.category}</span>
                                                                <button
                                                                    onClick={() => handleDelete(item.id)}
                                                                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>
                                                            </div>
                                                            <h3 className="text-sm font-black text-church-burgundy uppercase truncate">{item.title}</h3>
                                                            <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{item.description}</p>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminGallery;

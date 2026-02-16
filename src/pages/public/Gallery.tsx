import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, Image as ImageIcon, Film, ChevronLeft, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { MediaItem } from '../../data/galleryData';

const ITEMS_PER_PAGE = 9;

const Gallery: React.FC = () => {
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
    const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [galleryItems, setGalleryItems] = useState<MediaItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch('/api/gallery');
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setGalleryItems(data);
            } catch (err) {
                console.error('Error fetching gallery:', err);
                setIsLoading(false);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const filteredData = filter === 'all'
        ? galleryItems
        : galleryItems.filter(item => item.type === filter);

    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedData = filteredData.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const categories = ['all', 'image', 'video'];

    // Reset pagination when filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [filter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Smooth scroll to top of gallery section
        if (scrollRef.current) {
            const yOffset = -100; // Adjust for header
            const y = scrollRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 overflow-x-hidden pt-20">
            {/* Hero Section - Light & Sophisticated */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <motion.img
                        initial={{ scale: 1.1 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
                        src="/images/home-hero.jpg"
                        className="w-full h-full object-cover opacity-20 blur-[2px]"
                        alt="Gallery Backdrop"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-white/80 to-slate-50" />
                </div>

                <div className="relative z-10 text-center px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-block px-4 py-1.5 bg-church-burgundy/5 backdrop-blur-md rounded-full border border-church-burgundy/10 mb-6"
                    >
                        <span className="text-church-burgundy text-[10px] font-black uppercase tracking-[0.4em]">Visual Journey</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl md:text-8xl font-black text-church-burgundy uppercase tracking-tighter serif mb-6 leading-none"
                    >
                        THE <span className="text-church-gold">GALLERY</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto font-medium"
                    >
                        Witness the beauty of our church family, worship, and community through the lens.
                    </motion.p>
                </div>
            </section>

            <div ref={scrollRef} className="max-w-7xl mx-auto px-6 relative z-20 pb-32">
                {/* Filter Controls - Clean Floating Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white shadow-premium p-6 rounded-3xl border border-slate-100 mb-16"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-church-burgundy/5 flex items-center justify-center text-church-burgundy">
                            <Filter size={18} />
                        </div>
                        <h2 className="text-church-burgundy font-bold uppercase tracking-widest text-xs">Filter Experience</h2>
                    </div>

                    <div className="flex bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                        {categories.map((type) => (
                            <button
                                key={type}
                                onClick={() => setFilter(type as any)}
                                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all relative ${filter === type
                                    ? 'text-white'
                                    : 'text-slate-400 hover:text-church-burgundy'
                                    }`}
                            >
                                {filter === type && (
                                    <motion.div
                                        layoutId="activeFilter"
                                        className="absolute inset-0 bg-church-burgundy rounded-xl shadow-lg"
                                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                    />
                                )}
                                <span className="relative z-10">{type === 'all' ? 'Everything' : type + 's'}</span>
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Gallery Grid - Dynamic Staggered */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="text-xs font-black uppercase tracking-widest">Entering the Visual Journey...</p>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
                    >
                        <AnimatePresence mode='popLayout'>
                            {paginatedData.map((item, index) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -15 }}
                                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 cursor-pointer shadow-premium"
                                    onClick={() => setSelectedMedia(item)}
                                >
                                    <div className="relative aspect-[4/5] overflow-hidden">
                                        <img
                                            src={item.thumbnail}
                                            alt={item.title}
                                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                        />

                                        {/* Overlay Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                        {/* Play/View Button */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-90 group-hover:scale-100">
                                            {item.type === 'video' ? (
                                                <div className="w-20 h-20 bg-church-gold rounded-full flex items-center justify-center text-church-burgundy shadow-2xl">
                                                    <Play fill="currentColor" size={32} />
                                                </div>
                                            ) : (
                                                <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-full border border-white/30 flex items-center justify-center text-white">
                                                    <ImageIcon size={32} />
                                                </div>
                                            )}
                                        </div>

                                        {/* Category Tag */}
                                        <div className="absolute top-6 left-6">
                                            <div className="px-5 py-2 bg-white/90 backdrop-blur-md rounded-full border border-slate-100 shadow-sm">
                                                <span className="text-church-burgundy text-[9px] font-black uppercase tracking-[0.3em]">
                                                    {item.category}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Metadata */}
                                        <div className="absolute bottom-6 left-6 right-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 opacity-0 group-hover:opacity-100">
                                            <h3 className="text-2xl font-black text-white serif mb-1">{item.title}</h3>
                                            <div className="flex items-center gap-2 text-church-gold text-[10px] font-bold uppercase tracking-widest">
                                                <span>Experience {item.type}</span>
                                                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8 group-hover:bg-slate-50 transition-colors">
                                        <h3 className="text-xl font-black text-church-burgundy serif mb-2 uppercase tracking-tight">{item.title}</h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {/* Premium Pagination Controls */}
                {totalPages > 1 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-20 flex items-center justify-center gap-4"
                    >
                        <button
                            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`p-4 rounded-2xl border transition-all ${currentPage === 1
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-100 text-church-burgundy hover:bg-church-burgundy hover:text-white shadow-premium active:scale-95'
                                }`}
                        >
                            <ChevronLeft size={20} />
                        </button>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-slate-100 shadow-premium">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-12 h-12 rounded-xl text-xs font-black transition-all relative ${currentPage === page
                                        ? 'text-white'
                                        : 'text-slate-400 hover:text-church-burgundy hover:bg-slate-50'
                                        }`}
                                >
                                    {currentPage === page && (
                                        <motion.div
                                            layoutId="activePage"
                                            className="absolute inset-0 bg-church-burgundy rounded-xl shadow-lg"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{page}</span>
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`p-4 rounded-2xl border transition-all ${currentPage === totalPages
                                ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
                                : 'bg-white border-slate-100 text-church-burgundy hover:bg-church-burgundy hover:text-white shadow-premium active:scale-95'
                                }`}
                        >
                            <ChevronRight size={20} />
                        </button>
                    </motion.div>
                )}
            </div>

            {/* Premium Light Lightbox */}
            <AnimatePresence>
                {selectedMedia && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-white/95 backdrop-blur-xl transition-all p-4 md:p-12"
                    >
                        <button
                            onClick={() => setSelectedMedia(null)}
                            className="absolute top-8 right-8 z-[110] w-14 h-14 bg-slate-100 hover:bg-church-burgundy rounded-full flex items-center justify-center text-slate-500 hover:text-white transition-all group active:scale-95 shadow-sm"
                        >
                            <X size={24} className="group-hover:rotate-90 transition-transform" />
                        </button>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 50 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 50 }}
                            className="relative z-10 w-full max-w-6xl overflow-hidden rounded-[3rem] border border-slate-200 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.1)]"
                        >
                            <div className="flex flex-col lg:flex-row h-full">
                                {/* Media Content */}
                                <div className="flex-[2] aspect-video lg:aspect-auto bg-slate-900 flex items-center justify-center relative">
                                    {selectedMedia.type === 'video' ? (
                                        <iframe
                                            src={selectedMedia.url}
                                            className="w-full h-full absolute inset-0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <img
                                            src={selectedMedia.url}
                                            alt={selectedMedia.title}
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>

                                {/* Media Details */}
                                <div className="flex-1 p-10 bg-white border-l border-slate-100 flex flex-col justify-center">
                                    <div className="px-4 py-1.5 bg-church-burgundy/5 rounded-full border border-church-burgundy/10 w-fit mb-6">
                                        <span className="text-church-burgundy text-[10px] font-black uppercase tracking-[0.3em]">{selectedMedia.category}</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black text-church-burgundy serif mb-6 leading-tight uppercase tracking-tight">{selectedMedia.title}</h2>
                                    <p className="text-slate-600 text-lg leading-relaxed mb-10">
                                        {selectedMedia.description || "Witness the move of God in our congregation and community."}
                                    </p>

                                    <button
                                        onClick={() => setSelectedMedia(null)}
                                        className="mt-auto px-8 py-4 bg-church-burgundy text-white font-black text-xs uppercase tracking-[0.3em] rounded-2xl hover:bg-church-gold hover:shadow-lg transition-all w-fit"
                                    >
                                        Close Experience
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Background Aesthetic Layers */}
            <div className="fixed top-0 left-0 w-[500px] h-[500px] bg-church-burgundy/5 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-30" />
            <div className="fixed bottom-0 right-0 w-[800px] h-[800px] bg-church-gold/5 rounded-full blur-[200px] translate-x-1/2 translate-y-1/2 pointer-events-none opacity-20" />
        </div>
    );
};

export default Gallery;

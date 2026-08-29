import React, { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { GalleryItem } from '../../types';

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const GallerySection: React.FC = () => {
    const [items, setItems] = useState<GalleryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const { data, error } = await supabase
                    .from('gallery_items')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                setItems(data || []);
            } catch (err) {
                console.error('Error fetching gallery:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    const filteredItems = items.filter(item => filter === 'all' || item.type === filter);

    if (loading) return (
        <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-burgundy"></div>
        </div>
    );

    return (
        <section className="py-20 bg-white" id="gallery">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-black text-[#400010] mb-4 uppercase tracking-tight">
                        Our <span className="text-burgundy">Gallery</span>
                    </h2>
                    <div className="w-24 h-1 bg-gold mx-auto rounded-full mb-6"></div>
                    <p className="text-gray-600 max-w-2xl mx-auto">
                        Moments captured from our worship experiences, community events, and ministry outreach.
                    </p>
                </div>

                {/* Filter Buttons */}
                <div className="flex justify-center gap-4 mb-12">
                    {['all', 'image', 'video'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setFilter(type as any)}
                            className={`px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest transition-all ${filter === type
                                    ? 'bg-burgundy text-gold shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                }`}
                        >
                            {type === 'all' ? 'All Media' : type + 's'}
                        </button>
                    ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map((item) => (
                        <div key={item.id} className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 bg-gray-100">
                            <div className="aspect-[4/3] relative">
                                {item.type === 'image' ? (
                                    <img
                                        src={item.thumbnail || item.url}
                                        alt={item.title}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-700">
                                        {item.thumbnail ? (
                                            <img
                                                src={item.thumbnail}
                                                alt={item.title}
                                                className="w-full h-full object-cover opacity-90"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-black flex items-center justify-center">
                                                <span className="text-white/50 text-xs uppercase tracking-widest">Video Content</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                                    <span className="text-gold text-[10px] font-black uppercase tracking-widest mb-2">
                                        {item.category || 'General'}
                                    </span>
                                    <h3 className="text-white font-bold text-lg leading-tight mb-2">{item.title}</h3>
                                    {item.description && (
                                        <p className="text-gray-300 text-xs line-clamp-2">{item.description}</p>
                                    )}
                                </div>

                                {/* Link */}
                                <a
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="absolute inset-0 z-10"
                                    aria-label={`View ${item.title}`}
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-20 opacity-50">
                        <p className="text-gray-400 font-bold uppercase tracking-widest">No media found in this category</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default GallerySection;

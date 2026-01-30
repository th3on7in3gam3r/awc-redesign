
import React, { useState, useEffect } from 'react';
import { BLOG_POSTS } from '../../constants';

const Community: React.FC = () => {
  const [selectedPost, setSelectedPost] = useState<typeof BLOG_POSTS[0] | null>(null);

  // Scroll to top when a post is selected to ensure the user starts at the beginning
  useEffect(() => {
    if (selectedPost) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [selectedPost]);

  if (selectedPost) {
    return (
      <div className="pt-52 pb-20 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <button
            onClick={() => setSelectedPost(null)}
            className="mb-8 flex items-center gap-2 text-church-gold font-bold uppercase tracking-widest text-xs group"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to News
          </button>

          <div className="aspect-[21/9] rounded-[3rem] overflow-hidden shadow-2xl mb-12 border border-gray-100">
            <img src={selectedPost.imageUrl} className="w-full h-full object-cover" alt={selectedPost.title} />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-4 text-[10px] font-black text-church-gold uppercase tracking-[0.3em]">
              <span>{selectedPost.category}</span>
              <span className="w-1.5 h-1.5 bg-church-gold/30 rounded-full"></span>
              <span className="text-slate-400">{selectedPost.date}</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-church-burgundy serif leading-tight tracking-tight">{selectedPost.title}</h1>

            <div className="flex items-center gap-4 py-8 border-y border-gray-100 my-10">
              <div className="relative">
                <div className="absolute inset-0 bg-church-gold/20 rounded-full blur-md"></div>
                <img src={`https://i.pravatar.cc/150?u=${selectedPost.author}`} className="relative w-14 h-14 rounded-full border-2 border-church-gold shadow-lg" alt={selectedPost.author} />
              </div>
              <div>
                <p className="text-church-burgundy font-black uppercase tracking-widest text-xs">Shared By</p>
                <p className="text-xl font-bold text-slate-800 serif">{selectedPost.author}</p>
              </div>
            </div>

            <div className="prose prose-lg max-w-none text-slate-600 leading-relaxed space-y-8 pt-4">
              <p className="first-letter:text-7xl first-letter:font-black first-letter:text-church-burgundy first-letter:mr-3 first-letter:float-left serif">
                {selectedPost.content}
              </p>
              <p>The journey of faith is often navigated through the quiet moments of reflection and the shared experiences of our community. As we grow together at Anointed Worship Center, stories like these serve as milestones of God's grace in our lives.</p>
              <blockquote className="border-l-4 border-church-gold pl-8 py-4 italic text-2xl serif text-church-burgundy font-medium bg-church-gold/5 rounded-r-3xl">
                "For where two or three gather in my name, there am I with them."
              </blockquote>
              <p>We encourage you to find your own story within these pages and share how God is moving in your world. Your testimony could be the very thing that encourages a brother or sister today.</p>
            </div>

            {/* Comments Section */}
            <div className="mt-32 pt-20 border-t border-gray-100">
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-bold text-church-burgundy serif">Reflections <span className="text-church-gold ml-2 opacity-50 font-light italic">({selectedPost.comments.length})</span></h3>
                <div className="h-[1px] flex-1 bg-gradient-to-r from-church-gold/30 to-transparent ml-8"></div>
              </div>

              <div className="space-y-10 mb-20">
                {selectedPost.comments.length > 0 ? selectedPost.comments.map(c => (
                  <div key={c.id} className="flex gap-6 animate-slide-up">
                    <div className="flex-shrink-0">
                      <img
                        src={`https://i.pravatar.cc/100?u=${c.user}`}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md"
                        alt={c.user}
                      />
                    </div>
                    <div className="flex-1 bg-gray-50/50 border border-gray-100 p-8 rounded-[2rem] relative">
                      {/* Speech bubble arrow */}
                      <div className="absolute top-5 -left-2 w-4 h-4 bg-gray-50/50 border-l border-t border-gray-100 rotate-[-45deg]"></div>

                      <div className="flex justify-between items-center mb-4">
                        <p className="font-bold text-church-burgundy serif text-lg">{c.user}</p>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{c.date}</p>
                      </div>
                      <p className="text-slate-600 italic leading-relaxed">"{c.text}"</p>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-16 bg-gray-50 rounded-[3rem] border-2 border-dashed border-gray-200">
                    <i className="fa-solid fa-feather-pointed text-church-gold/20 text-5xl mb-6"></i>
                    <p className="text-slate-400 text-sm font-medium tracking-wide">No reflections yet. Be the first to share your blessing.</p>
                  </div>
                )}
              </div>

              {/* Enhanced Comment Input */}
              <div className="bg-church-burgundy rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden shadow-[0_40px_80px_-20px_rgba(74,4,4,0.4)]">
                <div className="absolute top-0 right-0 w-1/2 h-full bg-church-gold/5 -skew-x-12 translate-x-1/4"></div>
                <div className="relative z-10">
                  <div className="mb-10">
                    <span className="text-church-gold font-black tracking-[0.4em] uppercase text-[10px] mb-4 block">Fellowship</span>
                    <h4 className="text-3xl font-bold mb-4 serif">Leave a Reflection</h4>
                    <p className="text-gray-400 text-sm font-light max-w-lg leading-relaxed">Your words have the power to uplift. Share your thoughts or an encouraging word with the AWC family.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="relative group">
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-sm focus:outline-none focus:ring-2 focus:ring-church-gold/50 min-h-[180px] transition-all duration-300 placeholder:text-white/20"
                        placeholder="Type your reflection here..."
                      ></textarea>
                      <div className="absolute bottom-6 right-8 text-[10px] text-white/20 font-black uppercase tracking-widest">
                        Grace & Peace
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                      <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] font-black italic">
                        By posting, you agree to our community standards.
                      </p>
                      <button className="w-full sm:w-auto bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-12 py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-xl flex items-center justify-center gap-3">
                        Post Reflection <i className="fa-solid fa-paper-plane text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-52 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-24">
          <div className="w-20 h-[1px] bg-church-gold/30 mx-auto mb-8"></div>
          <span className="text-church-gold font-black tracking-[0.5em] uppercase text-[10px] mb-6 block">Our Digital Sanctuary</span>
          <h1 className="text-6xl font-bold text-church-burgundy mt-4 serif tracking-tight">Community Voices</h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto mt-6 font-light leading-relaxed italic">
            "And let us consider how we may spur one another on toward love and good deeds."
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 group cursor-pointer hover:-translate-y-3 transition-all duration-700 h-full flex flex-col"
              onClick={() => setSelectedPost(post)}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={post.imageUrl} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={post.title} />
                <div className="absolute inset-0 bg-church-burgundy/10 group-hover:bg-transparent transition-colors duration-500"></div>
                <div className="absolute top-6 left-6">
                  <span className="bg-white/95 backdrop-blur-md px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-church-burgundy shadow-lg">
                    {post.category}
                  </span>
                </div>
              </div>
              <div className="p-10 flex flex-col flex-1">
                <p className="text-[10px] text-church-gold mb-3 font-black uppercase tracking-[0.2em]">{post.date}</p>
                <h3 className="text-2xl font-bold text-church-burgundy mb-4 group-hover:text-church-gold transition-colors serif leading-tight h-16 line-clamp-2">{post.title}</h3>

                {/* Truncated Excerpt with Read More Button */}
                <div className="flex-1 mb-8">
                  <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed font-light mb-4">{post.excerpt}</p>
                  <button
                    className="flex items-center gap-2 text-church-gold font-black uppercase tracking-widest text-[10px] group/btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedPost(post);
                    }}
                  >
                    Read Full Reflection
                    <i className="fa-solid fa-arrow-right-long group-hover/btn:translate-x-1 transition-transform"></i>
                  </button>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <img src={`https://i.pravatar.cc/100?u=${post.author}`} className="w-10 h-10 rounded-xl border-2 border-white shadow-sm" alt={post.author} />
                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-400 group-hover:text-church-burgundy transition-colors">{post.author}</span>
                  </div>
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-church-gold group-hover:bg-church-gold group-hover:text-white transition-all duration-500">
                    <i className="fa-solid fa-chevron-right text-[10px]"></i>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Community;

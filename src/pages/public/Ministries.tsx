
import React, { useState } from 'react';
import { MINISTRIES } from '../../constants';
import { Ministry } from '../../types';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
}

const LEADER_TEAM: TeamMember[] = [
  {
    name: "Pastor Kenneth Mutegyeki",
    role: "Senior Pastor",
    bio: "Visionary leader dedicated to spiritual growth and community transformation through the radical power of the Word.",
    imageUrl: "https://anointedworshipcenter.com/images/pastor-ken.png"
  },
  {
    name: "First Lady Sania Mutegyeki",
    role: "First Lady",
    bio: "A pillar of grace and wisdom, leading our women's initiatives and community outreach with a heart for service.",
    imageUrl: "https://anointedworshipcenter.com/profiles/sania.png"
  },
  {
    name: "Pastor Janet Mukarrumongi",
    role: "Pastor (Nalongo)",
    bio: "Deeply committed to spiritual mentorship and nurturing the next generation of believers in Grace City.",
    imageUrl: "https://anointedworshipcenter.com/images/pastor-janet.jpeg"
  },
  {
    name: "Elder Ezra Tindyebwa",
    role: "Church Elder",
    bio: "Serving as a faithful guardian of the church's spiritual foundations and providing wise counsel to our family.",
    imageUrl: "https://anointedworshipcenter.com/images/elder-ezra.jpeg"
  },
];

const MINISTRY_TEAM: TeamMember[] = [
  { name: "Joel Kiwanuka", role: "Music Director", bio: "", imageUrl: "https://anointedworshipcenter.com/images/joelk.jpeg" },
  { name: "Paul Njenga", role: "Youth Minister", bio: "", imageUrl: "https://anointedworshipcenter.com/images/paul-n.jpg" },
  { name: "Gertrude Mutakubwa", role: "Children's Leader", bio: "", imageUrl: "https://anointedworshipcenter.com/images/gertrudem.jpeg" },
  { name: "Moses Agwisagye", role: "The Administrator", bio: "", imageUrl: "https://anointedworshipcenter.com/images/brother-admin.jpg" },
  { name: "Denis Kwesiga", role: "Men's Leader", bio: "", imageUrl: "https://anointedworshipcenter.com/images/denis-k.png" },
  { name: "Ezra Tindyebwa & Victoria Kamya", role: "Married Ministry Leaders", bio: "", imageUrl: "https://www.anointedworshipcenter.com/images/marrieds-about-pic.png" },
  { name: "Lorna Sekamwa", role: "Teen Ministry", bio: "", imageUrl: "https://via.placeholder.com/300x300/8B4513/FFFFFF?text=Teen+Ministry" },
];

const Ministries: React.FC = () => {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [joined, setJoined] = useState(false);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoined(true);
    setTimeout(() => {
      setJoined(false);
      setSelectedMinistry(null);
    }, 3000);
  };

  if (selectedMinistry) {
    return (
      <div className="pt-32 pb-20 bg-white min-h-screen">
        <div className="max-w-7xl mx-auto px-4">
          <button
            onClick={() => setSelectedMinistry(null)}
            className="mb-12 flex items-center gap-2 text-church-gold font-bold uppercase tracking-widest text-xs group"
          >
            <i className="fa-solid fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back to Ministries
          </button>

          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-8 animate-slide-up">
              <div className="w-20 h-20 bg-church-gold rounded-[2rem] flex items-center justify-center text-white text-3xl shadow-2xl shadow-church-gold/30">
                <i className={selectedMinistry.icon}></i>
              </div>
              <div>
                <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">Get Involved</span>
                <h1 className="text-6xl font-bold text-church-burgundy serif leading-none mb-6">{selectedMinistry.name}</h1>
                <p className="text-xl text-slate-600 leading-relaxed font-light">
                  {selectedMinistry.description}
                </p>
              </div>

              <div className="space-y-6 pt-6">
                <div className="flex gap-4 items-start">
                  <div className="mt-1 text-church-gold"><i className="fa-solid fa-calendar-day"></i></div>
                  <div>
                    <h4 className="font-bold text-church-burgundy uppercase tracking-widest text-xs">Meeting Schedule</h4>
                    <p className="text-slate-500 text-sm">Every 2nd and 4th Saturday • 10:00 AM</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-[3rem] p-10 border border-gray-100 shadow-xl relative overflow-hidden">
                {joined ? (
                  <div className="text-center py-10 animate-fade-in">
                    <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-3xl">
                      <i className="fa-solid fa-check"></i>
                    </div>
                    <h3 className="text-2xl font-bold text-church-burgundy serif mb-2">Welcome to the Family!</h3>
                    <p className="text-slate-500">A ministry leader will reach out to you within 48 hours.</p>
                  </div>
                ) : (
                  <>
                    <h3 className="text-2xl font-bold text-church-burgundy serif mb-6">Join This Ministry</h3>
                    <form onSubmit={handleJoin} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" required className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-church-gold/20" />
                        <input type="email" placeholder="Email Address" required className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-church-gold/20" />
                      </div>
                      <div className="relative">
                        <select
                          required
                          defaultValue=""
                          className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 focus:outline-none focus:ring-2 focus:ring-church-gold/20 appearance-none text-slate-600 font-medium"
                        >
                          <option value="" disabled>How did you hear about this ministry?</option>
                          <option value="service">Sunday Service Announcement</option>
                          <option value="social">Social Media (FB/Instagram)</option>
                          <option value="friend">Friend or Family Member</option>
                          <option value="website">Church Website</option>
                          <option value="community">Community Event</option>
                          <option value="other">Other</option>
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-church-gold">
                          <i className="fa-solid fa-chevron-down text-xs"></i>
                        </div>
                      </div>
                      <button type="submit" className="w-full bg-church-burgundy text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs hover:bg-church-gold transition-all duration-500 shadow-lg">
                        Submit Application
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="aspect-[4/5] rounded-[4rem] overflow-hidden shadow-2xl">
                <img src={selectedMinistry.imageUrl} className="w-full h-full object-cover" alt={selectedMinistry.name} />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* MODERN HERO SECTION */}
      <section className="relative h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-church-burgundy">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>

        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy via-church-burgundy/95 to-black/80"></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-church-gold/20 to-transparent"></div>

        {/* Floating Shapes */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-church-gold/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>

        {/* Content */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2 mb-8">
              <div className="w-2 h-2 bg-church-gold rounded-full animate-pulse"></div>
              <span className="text-white text-xs font-bold uppercase tracking-widest">Discover Your Purpose</span>
            </div>

            {/* Main Heading */}
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black text-white mb-8 leading-tight">
              Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-church-gold to-yellow-200">Ministries</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/80 font-light mb-12 max-w-3xl mx-auto leading-relaxed">
              Every member has a unique calling. Find where you belong and make an eternal impact in the Kingdom.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-lg hover:shadow-church-gold/50">
                Explore Ministries
              </button>
              <button className="bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300">
                Contact Us
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4">

          {/* Core Ministries Section */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">Get Involved</span>
              <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Core Ministries</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                Discover where your gifts and passions can make a difference in our community.
              </p>
            </div>

            {/* 3-Column Grid for Ministries */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {MINISTRIES.map((ministry) => (
                <div
                  key={ministry.id}
                  className="group relative bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-100 cursor-pointer transition-all duration-700 hover:-translate-y-4 hover:shadow-[0_20px_60px_rgba(139,0,0,0.3)]"
                  onClick={() => setSelectedMinistry(ministry)}
                >
                  {/* Image Container - Full Height */}
                  <div className="aspect-[4/5] overflow-hidden relative">
                    {ministry.imageUrl && (
                      <img
                        src={ministry.imageUrl}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        alt={ministry.name}
                      />
                    )}

                    {/* Gradient Overlay - Stronger at bottom */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500"></div>

                    {/* Accent Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-church-gold/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                  </div>

                  {/* Content Overlay - Positioned at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    {/* Icon Badge */}
                    <div className="w-16 h-16 bg-church-gold rounded-2xl flex items-center justify-center text-white text-2xl mb-5 shadow-2xl transform group-hover:rotate-6 group-hover:scale-110 transition-all duration-500">
                      {ministry.icon && <i className={ministry.icon}></i>}
                    </div>

                    {/* Ministry Name */}
                    <h3 className="text-3xl font-bold text-white mb-3 serif tracking-tight leading-tight">
                      {ministry.name}
                    </h3>

                    {/* Description - Slides up on hover */}
                    <p className="text-gray-200 text-sm leading-relaxed mb-5 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-100 line-clamp-3">
                      {ministry.description}
                    </p>

                    {/* CTA Button */}
                    <div className="flex items-center gap-3 opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-700 delay-200">
                      <div className="h-[2px] w-12 bg-church-gold"></div>
                      <span className="text-church-gold font-black uppercase tracking-[0.3em] text-[10px]">
                        Learn More
                      </span>
                      <i className="fa-solid fa-arrow-right text-church-gold text-xs group-hover:translate-x-1 transition-transform"></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pastoral Leadership Section */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">Our Leaders</span>
              <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Pastoral Leadership</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                Meet the shepherds guiding our spiritual journey with wisdom and compassion.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {LEADER_TEAM.map((leader, i) => (
                <div key={i} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-xl border border-gray-100 transition-all duration-500 hover:-translate-y-3">
                  <div className="aspect-[3/4] overflow-hidden relative">
                    <img src={leader.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={leader.name} />
                    <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-transparent to-transparent opacity-60"></div>
                    <div className="absolute bottom-6 left-6 right-6">
                      <p className="text-church-gold font-black uppercase tracking-[0.2em] text-[9px] mb-1">{leader.role}</p>
                      <h3 className="text-white text-xl font-bold serif leading-tight">{leader.name}</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-500 text-sm leading-relaxed">{leader.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ministry Leaders Section */}
          <div className="mb-32">
            <div className="text-center mb-16">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-4 block">Our Team</span>
              <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Ministry Leaders</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light">
                Dedicated servants leading with passion and purpose in their areas of calling.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-y-12 gap-x-6">
              {MINISTRY_TEAM.map((member, i) => (
                <div key={i} className="text-center group">
                  <div className="relative mb-4 mx-auto w-24 h-24 lg:w-32 lg:h-32">
                    <div className="absolute inset-0 rounded-full bg-church-gold scale-0 group-hover:scale-110 transition-transform duration-500 opacity-20"></div>
                    <img src={member.imageUrl} className="w-full h-full object-cover rounded-full border-4 border-white shadow-xl relative z-10" alt={member.name} />
                  </div>
                  <h4 className="text-church-burgundy font-bold text-[13px] leading-tight px-2">{member.name}</h4>
                  <p className="text-church-gold font-black uppercase tracking-widest text-[8px] mt-2 block opacity-80">{member.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Help Finding Ministry CTA */}
          <div className="mt-32 bg-church-burgundy rounded-[4rem] p-16 md:p-24 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-church-gold/5 -skew-x-12 translate-x-1/2"></div>
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <h2 className="text-white text-4xl md:text-5xl font-bold mb-8 serif">Discover Your Giftedness</h2>
              <p className="text-gray-400 text-lg mb-12 font-light leading-relaxed">
                Every member has a unique part to play in the body of Christ. Let us help you find yours.
              </p>
              <button className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500">
                Spiritual Gifts Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Ministries;

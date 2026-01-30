
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
    <div className="pt-52 pb-20 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4">
        {/* Page Title */}
        <div className="text-center mb-24">
          <span className="text-church-gold font-bold tracking-[0.4em] uppercase text-xs mb-4 block animate-fade-in">Service & Stewardship</span>
          <h1 className="text-6xl font-bold text-church-burgundy mb-6 serif leading-tight">Our Ministries & Leaders</h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-light leading-relaxed">
            Discover the heart behind our mission and the hands that lead the way at Anointed Worship Center.
          </p>
        </div>

        {/* 1. Pastoral Leadership Section */}
        <div className="mb-32">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-4xl font-bold text-church-burgundy serif">Pastoral Leadership</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
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

        {/* 2. Ministry Leaders Section (MOVED UP) */}
        <div className="mb-32">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-4xl font-bold text-church-burgundy serif">Ministry Leaders</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
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

        {/* 3. Core Ministries Section (MOVED DOWN) */}
        <div className="mb-32">
          <div className="flex items-center gap-6 mb-12">
            <h2 className="text-4xl font-bold text-church-burgundy serif">Core Ministries</h2>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-church-gold/40 to-transparent"></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {MINISTRIES.map((ministry) => (
              <div
                key={ministry.id}
                className="group relative bg-white rounded-[3rem] overflow-hidden shadow-2xl border border-gray-100 h-[450px] cursor-pointer hover:-translate-y-2 transition-all duration-700"
                onClick={() => setSelectedMinistry(ministry)}
              >
                {ministry.imageUrl && (
                  <img src={ministry.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt={ministry.name} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-church-burgundy/60 to-transparent transition-all duration-500"></div>

                <div className="absolute bottom-0 left-0 p-10 w-full">
                  <div className="w-14 h-14 bg-church-gold rounded-2xl flex items-center justify-center text-white text-xl mb-6 shadow-xl transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
                    {ministry.icon && <i className={ministry.icon}></i>}
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3 serif tracking-tight">{ministry.name}</h3>
                  <p className="text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-all duration-700 translate-y-4 group-hover:translate-y-0 max-w-sm line-clamp-2">
                    {ministry.description}
                  </p>
                  <div className="mt-6 flex items-center gap-4">
                    <span className="h-[1px] w-12 bg-church-gold/50"></span>
                    <button className="text-church-gold font-black uppercase tracking-[0.3em] text-[10px]">
                      Learn More
                    </button>
                  </div>
                </div>
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
  );
};

export default Ministries;

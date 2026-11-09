
import React, { useEffect, useState } from 'react';
import { MINISTRIES } from '../../constants';
import { Ministry } from '../../types';
import YouthMinistryDetail from '../../components/ministries/YouthMinistryDetail';
import WorshipArtsDetail from '../../components/ministries/WorshipArtsDetail';
import WomensMinistryDetail from '../../components/ministries/WomensMinistryDetail';
import PublicEventsDetail from '../../components/ministries/PublicEventsDetail';
import ChildrensMinistryDetail from '../../components/ministries/ChildrensMinistryDetail';

interface TeamMember {
  name: string;
  role: string;
  bio?: string;
  imageUrl: string;
  /** Branded graphic already includes name/title overlay */
  branded?: boolean;
}

const LEADER_TEAM: TeamMember[] = [
  {
    name: "Pastor Kenneth Mutegyeki",
    role: "Senior Pastor",
    bio: "Visionary leader dedicated to spiritual growth and community transformation through the radical power of the Word.",
    imageUrl: "/images/leadership/pastor-kenneth-mutegyeki.jpg",
    branded: true,
  },
  {
    name: "First Lady Sania Mutegyeki",
    role: "First Lady · Head of the Women's Ministry",
    bio: "A pillar of grace and wisdom, leading our women's initiatives and community outreach with a heart for service.",
    imageUrl: "/images/leadership/first-lady-sania-mutegyeki.jpg",
    branded: true,
  },
  {
    name: "Pastor Janet Mukarrumongi",
    role: "Pastor (Nalongo)",
    bio: "Deeply committed to spiritual mentorship and nurturing the next generation of believers in Acton, MA.",
    imageUrl: "/images/leadership/pastor-janet-mukarrumongi.jpg",
    branded: true,
  },
  {
    name: "Elder Ezra Tindyebwa",
    role: "Church Elder · Head of the Married's Ministry",
    bio: "Serving as a faithful guardian of the church's spiritual foundations and providing wise counsel to our family.",
    imageUrl: "/images/leadership/elder-ezra-tindyebwa.jpg",
    branded: true,
  },
];

const MINISTRY_TEAM: TeamMember[] = [
  {
    name: "Mr. Brian Setyabule",
    role: "Head of the Music Ministry",
    imageUrl: "/images/leadership/brian-setyabule.jpg",
    branded: true,
  },
  {
    name: "Mrs. Gertrude Mutakubwa",
    role: "Head of the Sunday School",
    imageUrl: "/images/leadership/gertrude-mutakubwa.jpg",
    branded: true,
  },
  {
    name: "Mr. Moses Agwisagye",
    role: "Church Administrator",
    imageUrl: "/images/leadership/moses-agwisagye.jpg",
    branded: true,
  },
  {
    name: "Mrs. Betty Liz Senyonjo",
    role: "Church Secretary",
    imageUrl: "/images/leadership/betty-liz-senyonjo.jpg",
    branded: true,
  },
  {
    name: "Mr. Paul Njenga",
    role: "Leader of the Youth Ministry · Church Custodian",
    imageUrl: "/images/leadership/paul-njenga.jpg",
    branded: true,
  },
  {
    name: "Ms. Winnie Nakabugo",
    role: "Assistant Church Secretary · Leader of the Singles Ministry",
    imageUrl: "/images/leadership/winnie-nakabugo.jpg",
    branded: true,
  },
  {
    name: "Mrs. Lorna Sekamwa",
    role: "Leader of the Teens Ministry",
    imageUrl: "/images/leadership/lorna-sekamwa.jpg",
    branded: true,
  },
  {
    name: "Mrs. Victoria Kamya",
    role: "Leader of the Marrieds Ministry",
    imageUrl: "/images/leadership/victoria-kamya.jpg",
    branded: true,
  },
  {
    name: "Sheevon Mahabir",
    role: "Head of the Finance & Events",
    imageUrl: "/images/leadership/sheevon-mahabir.jpg",
    branded: true,
  },
  {
    name: "Mrs. Ann Kwesiga",
    role: "Head of the Moderators' Ministry",
    imageUrl: "/images/leadership/ann-kwesiga.jpg",
    branded: true,
  },
  {
    name: "Ms. Nossie Bucyana",
    role: "Assistant Head of the Women's Ministry",
    imageUrl: "/images/leadership/nossie-bucyana.jpg",
    branded: true,
  },
  {
    name: "Mr. Herman Sekamwa",
    role: "Assistant Leader of the Intercessors Ministry",
    imageUrl: "/images/leadership/herman-sekamwa.jpg",
    branded: true,
  },
  {
    name: "Mr. Nathan Tendo",
    role: "Assistant Head of the Singles Ministry",
    imageUrl: "/images/leadership/nathan-tendo.jpg",
    branded: true,
  },
  {
    name: "Mrs. Sarah Bogere",
    role: "Head of Mount Moriah Prayer Altar",
    imageUrl: "/images/leadership/sarah-bogere.jpg",
    branded: true,
  },
  {
    name: "Mrs. Veronica Agaba",
    role: "Leader of the At the Foot of the Cross Prayer Altar",
    imageUrl: "/images/leadership/veronica-agaba.jpg",
    branded: true,
  },
];

const Ministries: React.FC = () => {
  const [selectedMinistry, setSelectedMinistry] = useState<Ministry | null>(null);
  const [selectedLeader, setSelectedLeader] = useState<TeamMember | null>(null);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!selectedLeader) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedLeader(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedLeader]);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    setJoined(true);
    setTimeout(() => {
      setJoined(false);
      setSelectedMinistry(null);
    }, 3000);
  };

  if (selectedMinistry) {
    if (selectedMinistry.id === 'youth') {
      return (
        <YouthMinistryDetail
          onBack={() => setSelectedMinistry(null)}
          joined={joined}
          onJoin={handleJoin}
        />
      );
    }

    if (selectedMinistry.id === 'worship') {
      return (
        <WorshipArtsDetail
          onBack={() => setSelectedMinistry(null)}
          joined={joined}
          onJoin={handleJoin}
        />
      );
    }

    if (selectedMinistry.id === 'women') {
      return (
        <WomensMinistryDetail
          onBack={() => setSelectedMinistry(null)}
          joined={joined}
          onJoin={handleJoin}
        />
      );
    }

    if (selectedMinistry.id === 'outreach') {
      return (
        <PublicEventsDetail
          onBack={() => setSelectedMinistry(null)}
          joined={joined}
          onJoin={handleJoin}
        />
      );
    }

    if (selectedMinistry.id === 'children') {
      return (
        <ChildrensMinistryDetail
          onBack={() => setSelectedMinistry(null)}
          joined={joined}
          onJoin={handleJoin}
        />
      );
    }

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
      {/* Page header */}
      <section className="relative overflow-hidden bg-church-burgundy pt-28 pb-14 md:pt-32 md:pb-16">
        <div className="absolute inset-0 bg-gradient-to-br from-church-burgundy via-church-burgundy to-[#2a0202]"></div>
        <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-church-gold/10 to-transparent pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 text-center">
          <p className="text-church-gold font-bold uppercase tracking-[0.35em] text-[10px] mb-3">
            Discover Your Purpose
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-white serif leading-tight mb-4">
            Our Ministries
          </h1>
          <p className="text-base md:text-lg text-white/70 font-light max-w-2xl mx-auto leading-relaxed mb-8">
            Every member has a unique calling. Find where you belong and make an eternal impact in the Kingdom.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => {
                document.querySelector('.ministries-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors duration-300"
            >
              Explore Ministries
            </button>
            <a
              href="/visit"
              className="border border-white/25 text-white hover:bg-white hover:text-church-burgundy px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] transition-colors duration-300 text-center"
            >
              Plan A Visit
            </a>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <div className="pt-14 md:pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4">

          {/* Core Ministries Section */}
          <div className="mb-24 ministries-section">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-3 block">Get Involved</span>
              <h2 className="text-3xl md:text-4xl font-bold text-church-burgundy serif mb-3">Core Ministries</h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">
                Discover where your gifts and passions can make a difference in our community.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {MINISTRIES.map((ministry) => (
                <button
                  key={ministry.id}
                  type="button"
                  onClick={() => setSelectedMinistry(ministry)}
                  className="group relative text-left aspect-[4/5] sm:aspect-[5/6] overflow-hidden rounded-2xl bg-church-burgundy focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
                >
                  {ministry.imageUrl && (
                    <img
                      src={ministry.imageUrl}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-church-burgundy via-church-burgundy/55 to-transparent" />
                  <div className="absolute inset-0 bg-church-burgundy/10 transition-colors duration-300 group-hover:bg-transparent" />

                  <div className="relative z-10 flex h-full flex-col justify-end p-5 md:p-6">
                    {ministry.icon && (
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-church-gold/15 text-church-gold text-sm backdrop-blur-sm">
                        <i className={ministry.icon} aria-hidden="true"></i>
                      </div>
                    )}
                    <h3 className="text-xl md:text-2xl font-bold text-white serif leading-snug mb-2">
                      {ministry.name}
                    </h3>
                    <p className="text-white/70 text-sm leading-relaxed line-clamp-2 mb-4 max-w-[28ch]">
                      {ministry.description}
                    </p>
                    <span className="inline-flex items-center gap-2 text-church-gold font-bold uppercase tracking-[0.18em] text-[10px]">
                      Explore
                      <i className="fa-solid fa-arrow-right text-[9px] transition-transform duration-300 group-hover:translate-x-1"></i>
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Pastoral Leadership Section */}
          <div className="mb-24">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-3 block">Our Leaders</span>
              <h2 className="text-3xl md:text-4xl font-bold text-church-burgundy serif mb-3">Pastoral Leadership</h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">
                Meet the shepherds guiding our spiritual journey with wisdom and compassion.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {LEADER_TEAM.map((leader) => (
                <button
                  key={leader.name}
                  type="button"
                  onClick={() => setSelectedLeader(leader)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm flex flex-col text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
                  aria-label={`View details for ${leader.name}, ${leader.role}`}
                >
                  <div className="aspect-square overflow-hidden bg-[#5c0a0a]">
                    <img
                      src={leader.imageUrl}
                      className={`w-full h-full object-cover ${leader.branded ? '' : 'object-top'}`}
                      alt=""
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4 md:p-5 flex-1">
                    <p className="text-church-gold font-bold uppercase tracking-[0.18em] text-[9px] mb-1">
                      {leader.role}
                    </p>
                    <h3 className="text-church-burgundy text-base md:text-lg font-bold serif leading-snug mb-2">
                      {leader.name}
                    </h3>
                    {leader.bio && (
                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3">
                        {leader.bio}
                      </p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Ministry Leaders Section */}
          <div className="mb-24">
            <div className="text-center mb-10 md:mb-12">
              <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-3 block">Our Team</span>
              <h2 className="text-3xl md:text-4xl font-bold text-church-burgundy serif mb-3">Ministry Leaders</h2>
              <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto font-light">
                Dedicated servants leading with passion and purpose in their areas of calling. Tap a leader for full details.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
              {MINISTRY_TEAM.map((member) => (
                <button
                  key={member.name}
                  type="button"
                  onClick={() => setSelectedLeader(member)}
                  className="rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-[#5c0a0a] group text-left transition-shadow hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold focus-visible:ring-offset-2"
                  aria-label={`View details for ${member.name}, ${member.role}`}
                >
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={member.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      alt=""
                      loading="lazy"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Help Finding Ministry CTA */}
          <div className="mt-8 bg-church-burgundy rounded-3xl p-10 md:p-14 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/3 h-full bg-church-gold/5 -skew-x-12 translate-x-1/2 pointer-events-none"></div>
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-white text-2xl md:text-3xl font-bold mb-4 serif">Discover Your Giftedness</h2>
              <p className="text-white/60 text-base mb-8 font-light leading-relaxed">
                Every member has a unique part to play in the body of Christ. Let us help you find yours.
              </p>
              <button
                type="button"
                className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-8 py-3.5 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] transition-colors duration-300"
              >
                Spiritual Gifts Assessment
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedLeader && (
        <div
          className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="leader-modal-name"
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            aria-label="Close leader details"
            onClick={() => setSelectedLeader(null)}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden animate-slide-up max-h-[92vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setSelectedLeader(null)}
              className="absolute top-3 right-3 z-20 w-10 h-10 rounded-full bg-black/45 text-white hover:bg-black/60 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <i className="fa-solid fa-xmark text-sm"></i>
            </button>

            <div className="aspect-square bg-[#5c0a0a]">
              <img
                src={selectedLeader.imageUrl}
                alt={selectedLeader.name}
                className={`w-full h-full object-cover ${selectedLeader.branded ? '' : 'object-top'}`}
              />
            </div>

            <div className="p-6 md:p-7 text-center">
              <p className="text-church-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-2">
                {selectedLeader.role}
              </p>
              <h3
                id="leader-modal-name"
                className="text-church-burgundy text-2xl md:text-[1.7rem] font-bold serif leading-snug mb-3"
              >
                {selectedLeader.name}
              </h3>
              {selectedLeader.bio && (
                <p className="text-slate-500 text-sm md:text-base leading-relaxed font-light">
                  {selectedLeader.bio}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Ministries;


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
    name: "Mrs. Sheevon Mahabir",
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

const FEATURED_LEADERS = [
  {
    displayName: 'Kenneth Mutegyeki',
    secondLine: 'MSN APRN PMHNP-BC',
    title: 'Senior Pastor',
    imageUrl: '/images/leadership/pastor-kenneth-feature.png',
    leaderIndex: 0,
  },
  {
    displayName: 'First Lady',
    secondLine: 'Sania Mutegyeki',
    title: "First Lady · Head of the Women's Ministry",
    imageUrl: '/images/leadership/first-lady-sania-feature.png',
    leaderIndex: 1,
  },
];

const SectionHeading: React.FC<{ title: string; subtitle?: string }> = ({ title, subtitle }) => (
  <div className="text-center">
    <div className="flex items-center justify-center gap-4 md:gap-6">
      <span className="h-[2px] w-8 sm:w-24 md:w-40 bg-gradient-to-r from-transparent to-church-gold" aria-hidden="true" />
      <h2 className="font-serif font-bold text-church-burgundy text-[1.75rem] sm:text-3xl md:text-[2.6rem] leading-tight whitespace-nowrap">{title}</h2>
      <span className="h-[2px] w-8 sm:w-24 md:w-40 bg-gradient-to-l from-transparent to-church-gold" aria-hidden="true" />
    </div>
    {subtitle && <p className="mt-2 text-slate-600 text-base md:text-lg">{subtitle}</p>}
  </div>
);

const LeaderCard: React.FC<{
  member: TeamMember;
  onSelect: (m: TeamMember) => void;
  className?: string;
  large?: boolean;
}> = ({ member, onSelect, className = '', large = false }) => (
  <button
    type="button"
    onClick={() => onSelect(member)}
    className={`group flex flex-col overflow-hidden rounded-xl bg-[#fffaf2] text-center shadow-[0_10px_26px_-14px_rgba(74,4,4,0.45)] ring-1 ring-[#ead9b8] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_-14px_rgba(74,4,4,0.5)] focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold ${className}`}
    aria-label={`View details for ${member.name}, ${member.role}`}
  >
    {/* Crop to the photo area; the branded name banner sits in the lower third of the image */}
    <div className={`${large ? 'aspect-[16/10]' : 'aspect-[3/2]'} overflow-hidden bg-[#5c0a0a]`}>
      <img
        src={member.imageUrl}
        alt=""
        className="h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
        loading="lazy"
      />
    </div>
    <div className={`flex flex-1 flex-col justify-center px-3 ${large ? 'py-3.5' : 'py-2.5 sm:py-3'}`}>
      <h3 className={`font-serif font-bold text-church-burgundy leading-snug ${large ? 'text-lg' : 'text-[13px] sm:text-[15px]'}`}>
        {member.name}
      </h3>
      <p className={`mt-0.5 font-serif italic text-[#a8842b] leading-snug line-clamp-2 ${large ? 'text-sm' : 'text-[11px] sm:text-[13px]'}`}>
        {member.role}
      </p>
    </div>
  </button>
);

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
    <div className="bg-[#f8f1e5] min-h-screen">
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

      {/* Leadership — cream mockup */}
      <section id="leadership" className="relative overflow-hidden bg-[#f8f1e5] pt-14 md:pt-20 pb-20 md:pb-24">
        {/* soft cream waves */}
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-56 w-full opacity-80" viewBox="0 0 1440 220" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 140 C 260 60, 560 200, 860 130 S 1280 70, 1440 150 L1440 220 L0 220 Z" fill="#efe1c8" />
          <path d="M0 150 C 260 70, 560 210, 860 140 S 1280 80, 1440 160" stroke="#d4af37" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 md:px-6">
          {/* Meet Our Pastor & First Lady */}
          <div className="relative overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#fdf9f2] via-[#f9f1e3] to-[#f3e6cf] border border-[#ead9b8] shadow-[0_24px_60px_-28px_rgba(74,4,4,0.35)] p-6 sm:p-8 md:p-10">
            <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full" viewBox="0 0 1000 100" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 70 C 200 20, 420 100, 640 60 S 900 30, 1000 70 L1000 100 L0 100 Z" fill="#efe0c4" opacity="0.7" />
            </svg>
            <div className="relative grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-4">
                <p className="text-[#a8842b] font-bold uppercase tracking-[0.22em] text-xs">Our Leadership</p>
                <div className="mt-3 h-[3px] w-12 rounded-full bg-church-gold" aria-hidden="true" />
                <h2 className="mt-5 font-serif font-bold text-church-burgundy text-4xl sm:text-5xl md:text-[2.75rem] lg:text-5xl leading-[1.05]">
                  Meet Our <br className="hidden md:block" />Pastor &amp; <br className="hidden md:block" />First Lady
                </h2>
                <p className="mt-5 text-slate-700 text-[15px] leading-relaxed max-w-xs">
                  Get to know the pastoral leadership of Anointed Worship Center.
                </p>
              </div>

              <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                {FEATURED_LEADERS.map((f) => (
                  <div key={f.displayName} className="flex flex-col overflow-hidden rounded-2xl bg-[#fffaf2] shadow-[0_14px_34px_-18px_rgba(0,0,0,0.45)] ring-1 ring-black/5">
                    <button
                      type="button"
                      onClick={() => setSelectedLeader(LEADER_TEAM[f.leaderIndex])}
                      className="group relative aspect-[10/9] overflow-hidden bg-gradient-to-b from-[#4a4a4f] via-[#36363a] to-[#232326] focus:outline-none focus-visible:ring-2 focus-visible:ring-church-gold"
                      aria-label={`View details for ${[f.displayName, f.secondLine].filter(Boolean).join(' ')}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.12),transparent_65%)]" aria-hidden="true" />
                      <img
                        src={f.imageUrl}
                        alt={[f.displayName, f.secondLine].filter(Boolean).join(' ')}
                        className="relative h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.03]"
                        loading="lazy"
                      />
                    </button>
                    <div className="flex flex-1 flex-col px-5 pt-4 pb-4">
                      <h3 className="font-serif font-bold text-church-burgundy text-lg md:text-xl leading-snug">{f.displayName}</h3>
                      {f.secondLine && (
                        <p className="font-serif font-semibold text-church-burgundy/80 text-sm tracking-wide">{f.secondLine}</p>
                      )}
                      <p className="mt-0.5 font-serif italic text-[#a8842b] text-sm">{f.title}</p>
                      <div className="mt-4 border-t border-[#ead9b8] pt-3">
                        <button
                          type="button"
                          onClick={() => document.getElementById('pastoral-leadership')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                          className="inline-flex items-center gap-2 font-serif text-sm font-semibold text-church-burgundy hover:text-[#a8842b] transition-colors"
                        >
                          Meet Our Leaders <span aria-hidden="true">&rarr;</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pastoral Leadership */}
          <div id="pastoral-leadership" className="mt-16 md:mt-20 scroll-mt-28">
            <SectionHeading title="Pastoral Leadership" />
            <div className="mt-8 flex flex-wrap justify-center gap-5 md:gap-8">
              {LEADER_TEAM.slice(2).map((leader) => (
                <LeaderCard
                  key={leader.name}
                  member={leader}
                  onSelect={setSelectedLeader}
                  className="w-full max-w-[290px] sm:w-[calc(50%-0.75rem)] md:w-[260px]"
                  large
                />
              ))}
            </div>
          </div>

          {/* Ministry Leaders */}
          <div className="mt-16 md:mt-20">
            <SectionHeading title="Ministry Leaders" subtitle="Dedicated servants leading with faith and purpose." />
            <div className="mt-8 flex flex-wrap justify-center gap-3 sm:gap-5">
              {MINISTRY_TEAM.map((member) => (
                <LeaderCard
                  key={member.name}
                  member={member}
                  onSelect={setSelectedLeader}
                  className="w-[calc(50%-0.375rem)] sm:w-[calc(33.333%-0.84rem)] lg:w-[calc(25%-0.94rem)]"
                />
              ))}
            </div>
          </div>

          {/* Core Ministries */}
          <div className="ministries-section mt-16 md:mt-20 scroll-mt-28">
            <p className="text-center text-[#a8842b] font-bold uppercase tracking-[0.3em] text-xs mb-2">Get Involved</p>
            <SectionHeading title="Core Ministries" subtitle="Discover where your gifts and passions can make a difference in our community." />
            <div className="mt-8">
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
          </div>
        </div>
      </section>

      {/* Discover Your Giftedness */}
      <section className="relative overflow-hidden border-t-4 border-church-gold bg-gradient-to-br from-[#7a1020] via-church-burgundy to-[#2a0202] py-12 md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_120%,rgba(212,175,55,0.18),transparent_55%)]" aria-hidden="true" />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-serif font-bold text-white text-3xl md:text-4xl">Discover Your Giftedness</h2>
          <p className="mt-3 text-white/85 text-base md:text-lg">
            Use your God-given gifts to serve, lead, and make an eternal impact at AWC.
          </p>
          <button
            type="button"
            onClick={() => document.querySelector('.ministries-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="mt-7 inline-flex items-center gap-2 rounded-full px-8 py-3 text-xs font-bold uppercase tracking-[0.14em] text-church-burgundy shadow-lg transition hover:brightness-110"
            style={{ backgroundImage: 'linear-gradient(180deg, #f6dc8c 0%, #d9b14f 70%, #b88f2f 100%)' }}
          >
            Find Your Place to Serve <span aria-hidden="true">&rarr;</span>
          </button>
        </div>
      </section>

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

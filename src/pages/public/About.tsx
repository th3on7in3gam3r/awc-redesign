import React from 'react';
import { Link } from 'react-router-dom';

const About: React.FC = () => {
    const beliefs = [
        {
            icon: 'fa-book-bible',
            title: 'Authority of Scripture',
            description: 'We believe the Bible is the inspired, infallible Word of God and our final authority for faith and practice.'
        },
        {
            icon: 'fa-hands-praying',
            title: 'The Trinity',
            description: 'We believe in one God eternally existing in three persons: Father, Son, and Holy Spirit.'
        },
        {
            icon: 'fa-cross',
            title: 'Salvation Through Christ',
            description: 'We believe salvation is found in Jesus Christ alone through faith, not by works, and is available to all who believe.'
        },
        {
            icon: 'fa-water',
            title: 'Water Baptism',
            description: 'We practice baptism by immersion as an outward expression of an inward transformation in Christ.'
        },
        {
            icon: 'fa-fire',
            title: 'Holy Spirit Baptism',
            description: 'We believe in the baptism of the Holy Spirit with the evidence of speaking in tongues and the manifestation of spiritual gifts.'
        },
        {
            icon: 'fa-hand-holding-heart',
            title: 'Healing & Miracles',
            description: 'We believe in divine healing and that God still performs miracles today through faith and prayer.'
        },
        {
            icon: 'fa-cloud',
            title: 'Second Coming',
            description: 'We believe in the personal, visible return of Jesus Christ to establish His eternal kingdom.'
        },
        {
            icon: 'fa-church',
            title: 'The Church',
            description: 'We believe the Church is the body of Christ, called to worship, fellowship, discipleship, and evangelism.'
        }
    ];

    const values = [
        {
            title: 'Worship',
            description: 'We prioritize authentic, passionate worship that ushers in God\'s presence.',
            color: 'from-purple-500 to-church-burgundy'
        },
        {
            title: 'Community',
            description: 'We foster genuine relationships and create a family atmosphere where everyone belongs.',
            color: 'from-church-gold to-yellow-600'
        },
        {
            title: 'Excellence',
            description: 'We pursue excellence in all we do as an offering of worship to God.',
            color: 'from-blue-500 to-indigo-600'
        },
        {
            title: 'Generosity',
            description: 'We give freely of our time, talents, and resources to advance God\'s kingdom.',
            color: 'from-green-500 to-emerald-600'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="relative h-[70vh] min-h-[600px] flex items-center overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=2000"
                        className="w-full h-full object-cover"
                        alt="Church Worship"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-church-burgundy/90 via-church-burgundy/70 to-transparent"></div>
                </div>

                <div className="container mx-auto px-6 relative z-10">
                    <div className="max-w-3xl">
                        <span className="text-church-gold font-black tracking-[0.4em] uppercase text-xs mb-6 block animate-fade-in">What We Believe</span>
                        <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 serif leading-tight">Our Beliefs</h1>
                        <p className="text-xl md:text-2xl text-gray-200 leading-relaxed mb-10 font-light">
                            Rooted in Scripture, empowered by the Spirit, and committed to transforming lives through the radical love of Jesus Christ.
                        </p>
                        <div className="flex gap-4">
                            <Link to="/visit" className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300 shadow-xl">
                                Plan Your Visit
                            </Link>
                            <Link to="/connect" className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-church-burgundy px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs transition-all duration-300">
                                Connect With Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Core Beliefs Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-church-gold font-bold tracking-[0.4em] uppercase text-xs block mb-4">Our Foundation</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Core Beliefs</h2>
                        <p className="text-xl text-slate-500 max-w-3xl mx-auto font-light">
                            These fundamental truths guide our church and shape our community.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {beliefs.map((belief, index) => (
                            <div
                                key={index}
                                className="group bg-gray-50 rounded-[2rem] p-8 border border-gray-100 hover:shadow-2xl hover:border-church-gold/20 transition-all duration-500 hover:-translate-y-2"
                            >
                                <div className="w-16 h-16 bg-church-gold/10 rounded-2xl flex items-center justify-center text-church-gold text-2xl mb-6 group-hover:bg-church-gold group-hover:text-white transition-all duration-500">
                                    <i className={`fa-solid ${belief.icon}`}></i>
                                </div>
                                <h3 className="text-xl font-bold text-church-burgundy mb-4 serif">{belief.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{belief.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Mission & Vision Section */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16">
                        <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 relative overflow-hidden shadow-xl">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-church-gold/5 -skew-x-12 translate-x-1/4"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-church-gold/10 rounded-2xl flex items-center justify-center text-church-gold text-2xl mb-8">
                                    <i className="fa-solid fa-eye"></i>
                                </div>
                                <h3 className="text-4xl font-bold text-church-burgundy mb-6 serif">Our Vision</h3>
                                <div className="space-y-6">
                                    <div className="bg-church-burgundy/5 rounded-2xl p-6 border-l-4 border-church-gold">
                                        <p className="text-sm font-bold text-church-burgundy mb-2">Matthew 28:18-20 (NIV)</p>
                                        <p className="text-slate-600 text-sm leading-relaxed italic">
                                            <sup className="text-church-gold font-bold">18</sup> Then Jesus came to them and said, "All authority in heaven and on earth has been given to me. <sup className="text-church-gold font-bold">19</sup> Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, <sup className="text-church-gold font-bold">20</sup> and teaching them to obey everything I have commanded you. And surely I am with you always, to the very end of the age."
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-church-burgundy rounded-[3rem] p-12 md:p-16 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-church-gold/5 -skew-x-12 translate-x-1/4"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-church-gold text-2xl mb-8">
                                    <i className="fa-solid fa-bullseye"></i>
                                </div>
                                <h3 className="text-4xl font-bold mb-6 serif">Our Mission Statement</h3>
                                <p className="text-gray-200 text-lg leading-relaxed">
                                    Our Mission is to reach the lost with the saving message of Jesus Christ, make devoted disciples, baptized and teach them to obey all Jesus Christ's commands and relying on the authority in His word and presence every step of the way.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <span className="text-church-gold font-bold tracking-[0.4em] uppercase text-xs block mb-4">What Guides Us</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Our Values</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {values.map((value, index) => (
                            <div
                                key={index}
                                className="group relative bg-white rounded-[2rem] p-8 border-2 border-gray-100 hover:border-transparent transition-all duration-500 overflow-hidden"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${value.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                                <div className="relative z-10">
                                    <h3 className="text-2xl font-bold text-church-burgundy mb-4 serif group-hover:text-white transition-colors duration-500">{value.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed group-hover:text-white/90 transition-colors duration-500">{value.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Statement of Faith */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-church-gold font-bold tracking-[0.4em] uppercase text-xs block mb-4">Our Foundation</span>
                        <h2 className="text-5xl md:text-6xl font-bold text-church-burgundy serif mb-6">Statement of Faith</h2>
                    </div>

                    <div className="bg-white rounded-[3rem] p-12 md:p-16 border border-gray-200 shadow-xl">
                        <div className="space-y-8 text-slate-600 leading-relaxed">
                            <p className="text-lg">
                                We affirm the historic Christian faith as expressed in the Apostles' Creed and hold to the following core doctrines:
                            </p>
                            <ul className="space-y-4 text-sm">
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">The Bible:</strong> We believe the Bible is the inspired, inerrant, and authoritative Word of God (2 Timothy 3:16-17).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">God:</strong> We believe in one God, eternally existing in three persons: Father, Son, and Holy Spirit (Matthew 28:19).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">Jesus Christ:</strong> We believe Jesus Christ is fully God and fully man, born of a virgin, lived a sinless life, died for our sins, rose from the dead, and ascended to heaven (John 1:1, 14; 1 Corinthians 15:3-4).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">Salvation:</strong> We believe salvation is by grace alone, through faith alone, in Christ alone (Ephesians 2:8-9).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">The Holy Spirit:</strong> We believe the Holy Spirit indwells believers, empowers them for service, and manifests spiritual gifts for the edification of the church (Acts 1:8; 1 Corinthians 12).</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <i className="fa-solid fa-check text-church-gold mt-1"></i>
                                    <span><strong className="text-church-burgundy">The Church:</strong> We believe the Church is the body of Christ, called to worship, fellowship, discipleship, and evangelism (Ephesians 4:11-16).</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-church-burgundy text-white">
                <div className="max-w-4xl mx-auto px-6 text-center">
                    <h2 className="text-5xl md:text-6xl font-bold mb-8 serif">Join Our Family</h2>
                    <p className="text-xl text-gray-200 mb-12 leading-relaxed font-light">
                        We'd love to meet you! Experience the warmth of our community and the power of God's presence.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/visit" className="bg-church-gold hover:bg-white text-white hover:text-church-burgundy px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500 shadow-xl">
                            Plan Your Visit
                        </Link>
                        <Link to="/events" className="bg-white/10 backdrop-blur-md border border-white/30 text-white hover:bg-white hover:text-church-burgundy px-12 py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs transition-all duration-500">
                            View Events
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default About;

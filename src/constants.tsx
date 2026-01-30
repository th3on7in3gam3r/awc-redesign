
import { Sermon, Ministry, BlogPost, ChurchEvent } from './types';

export const CHURCH_NAME = "Anointed Worship Center";
export const TAGLINE = "A Place of Purpose, Power, and Praise";

export const SERVICE_TIMES = [
  { day: "Sundays", time: "10:00 AM", type: "Morning Worship" },
  { day: "Wednesdays", time: "7:00 PM", type: "Bible Study (Virtual)" },
];

export const SERMONS: Sermon[] = [
  {
    id: "1",
    title: "Walking in Divine Favor",
    speaker: "Senior Pastor Marcus Thorne",
    date: "May 12, 2024",
    category: "Favor",
    imageUrl: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "2",
    title: "The Power of Stillness",
    speaker: "Co-Pastor Elena Thorne",
    date: "May 5, 2024",
    category: "Growth",
    imageUrl: "https://images.unsplash.com/photo-1518050947974-4be8c7469f0c?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  },
  {
    id: "3",
    title: "Strength in the Storm",
    speaker: "Senior Pastor Marcus Thorne",
    date: "April 28, 2024",
    category: "Faith",
    imageUrl: "https://images.unsplash.com/photo-1478147427282-58a87a120781?auto=format&fit=crop&q=80&w=800",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ"
  }
];

export const MINISTRIES: Ministry[] = [
  {
    id: "youth",
    name: "Youth Empowerment",
    description: "Equipping the next generation with faith, purpose, and community.",
    icon: "fa-solid fa-child-reaching",
    imageUrl: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "outreach",
    name: "Community Outreach",
    description: "Sharing the love of Christ beyond our four walls through service.",
    icon: "fa-solid fa-handshake-angle",
    imageUrl: "https://images.unsplash.com/photo-1469571483333-24322989cc0c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "worship",
    name: "Worship Arts",
    description: "Ushering in the presence of God through music, dance, and creative media.",
    icon: "fa-solid fa-music",
    imageUrl: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "education",
    name: "Faith Academy",
    description: "Deepening your theological understanding through systematic Bible study.",
    icon: "fa-solid fa-book-bible",
    imageUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?auto=format&fit=crop&q=80&w=800",
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "b1",
    title: "Finding Peace in a Fast-Paced World",
    excerpt: "In a world that never stops, discover how to find the stillness and rest that God promises His children.",
    content: "Living in 2024 means constant notifications, endless to-do lists, and a pace that rarely slows down. Yet in the midst of this chaos, God invites us to 'Be still and know that I am God' (Psalm 46:10). This isn't just a suggestion—it's a divine prescription for our weary souls. When we intentionally create space for stillness, we open ourselves to hear God's voice more clearly, to experience His peace that surpasses understanding, and to be renewed in His presence. The question isn't whether we have time for stillness, but whether we can afford not to make time for it.",
    author: "Pastor Elena Thorne",
    date: "January 15, 2026",
    category: "Spiritual Growth",
    imageUrl: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c1", user: "Sarah Mitchell", text: "This message came at the perfect time. I've been feeling so overwhelmed, and this reminded me to pause and seek God first. Thank you, Pastor Elena!", date: "January 16, 2026" },
      { id: "c2", user: "David Chen", text: "Powerful reminder that stillness isn't laziness—it's spiritual discipline. Starting my mornings with 15 minutes of quiet time has transformed my days.", date: "January 17, 2026" }
    ]
  },
  {
    id: "b2",
    title: "The Power of Community Prayer",
    excerpt: "Discover how gathering together in prayer multiplies our faith and transforms our church family.",
    content: "There's something supernatural that happens when believers gather to pray. Jesus promised, 'Where two or three gather in my name, there am I with them' (Matthew 18:20). Our Wednesday night prayer meetings have become a powerful testimony to this truth. We've witnessed healings, breakthroughs in relationships, financial miracles, and lives transformed—all because we chose to come together and seek God's face as one body. Community prayer isn't just about presenting our requests; it's about building unity, strengthening our faith, and experiencing God's presence in a profound way.",
    author: "Pastor Marcus Thorne",
    date: "January 10, 2026",
    category: "Prayer & Worship",
    imageUrl: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c3", user: "Jennifer Adams", text: "I was skeptical about prayer meetings until I attended one. The atmosphere was so filled with God's presence. I felt my burdens lift!", date: "January 11, 2026" }
    ]
  },
  {
    id: "b3",
    title: "Raising Kingdom Kids in a Digital Age",
    excerpt: "Practical wisdom for parents navigating faith formation in the age of smartphones and social media.",
    content: "As parents, we're facing challenges our own parents never encountered. How do we raise children who love God when they're constantly bombarded with worldly messages through screens? The answer isn't to completely disconnect our kids from technology, but to intentionally disciple them to use it wisely. This means modeling healthy boundaries ourselves, creating tech-free family times for prayer and conversation, and teaching our children to filter everything through God's Word. Our children are growing up in a digital world, but they don't have to be shaped by it—they can be world-changers who use technology for God's glory.",
    author: "Minister Tasha Williams",
    date: "January 5, 2026",
    category: "Family & Parenting",
    imageUrl: "https://images.unsplash.com/photo-1476234251651-f353703a034d?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c4", user: "Michael Johnson", text: "As a dad of three teens, this is exactly what I needed to hear. We're implementing 'phone-free Sundays' starting this week!", date: "January 6, 2026" },
      { id: "c5", user: "Lisa Rodriguez", text: "Thank you for the practical tips! The idea of teaching kids to 'filter through God's Word' is so powerful.", date: "January 7, 2026" }
    ]
  },
  {
    id: "b4",
    title: "From Broken to Beautiful: A Testimony",
    excerpt: "One member's journey from addiction to freedom through the transforming power of Christ.",
    content: "Five years ago, I walked through the doors of Anointed Worship Center broken, addicted, and hopeless. I had lost my job, my family's trust, and nearly my life. But God... those two words changed everything. Through the love of this church family, accountability in small groups, and the relentless pursuit of Jesus, I found freedom. Today, I'm not just sober—I'm whole. I'm not just surviving—I'm thriving. And I'm not just saved—I'm being used by God to help others find the same freedom. If you're struggling today, please know: your story isn't over. God specializes in turning broken into beautiful.",
    author: "James Carter",
    date: "December 28, 2025",
    category: "Testimony",
    imageUrl: "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c6", user: "Pastor Marcus", text: "James, your testimony is a powerful reminder that no one is beyond God's reach. So proud of the man you've become!", date: "December 29, 2025" },
      { id: "c7", user: "Angela White", text: "This brought tears to my eyes. Thank you for your courage in sharing. Your story gives me hope for my brother.", date: "December 30, 2025" },
      { id: "c8", user: "Robert King", text: "Brother James, you are a living testimony of God's redemptive power. Keep shining your light!", date: "January 2, 2026" }
    ]
  },
  {
    id: "b5",
    title: "The Heart of Service: Our Community Outreach",
    excerpt: "How serving our neighborhood is transforming lives—both those we serve and those who serve.",
    content: "Every Saturday morning, our outreach team hits the streets—not with judgment, but with love. We serve hot meals to the homeless, provide groceries to struggling families, and offer prayer to anyone who needs it. What started as a small initiative has grown into a movement that's touching hundreds of lives monthly. But here's what we've discovered: we're not just blessing others—we're being blessed. When we step out of our comfort zones to serve, we encounter Jesus in the faces of those we help. We're learning that the Gospel isn't just something we preach; it's something we live out in practical, tangible ways.",
    author: "Deacon Robert Hayes",
    date: "December 20, 2025",
    category: "Community Outreach",
    imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c9", user: "Maria Santos", text: "Serving with the outreach team has changed my life. I used to think faith was just about Sunday service. Now I see it's about being Jesus to others every day.", date: "December 21, 2025" }
    ]
  },
  {
    id: "b6",
    title: "Worship Beyond the Walls",
    excerpt: "Understanding that true worship isn't confined to Sunday mornings—it's a lifestyle of surrender.",
    content: "We often think of worship as singing songs on Sunday morning, but Romans 12:1 calls us to offer our entire lives as 'living sacrifices'—that's true worship. Worship is how we treat our coworkers, how we handle our finances, how we respond to trials, and how we love our families. It's choosing obedience when no one is watching and giving God glory in the mundane moments. When we understand that worship is a lifestyle, not just a Sunday event, everything changes. Our Monday mornings become as sacred as our Sunday services, and our everyday choices become acts of devotion.",
    author: "Worship Leader Jasmine Brooks",
    date: "December 15, 2025",
    category: "Worship",
    imageUrl: "https://images.unsplash.com/photo-1507676184212-d03ab07a01bf?auto=format&fit=crop&q=80&w=800",
    comments: [
      { id: "c10", user: "Kevin Thompson", text: "This perspective shift is exactly what I needed. Worship isn't just what I do at church—it's who I am!", date: "December 16, 2025" },
      { id: "c11", user: "Nicole Brown", text: "Beautiful reminder that every moment is an opportunity to worship. Thank you, Jasmine!", date: "December 17, 2025" }
    ]
  }
];

export const EVENTS: ChurchEvent[] = [
  {
    id: "e1",
    title: "New Year Prayer & Fasting",
    description: "Join us for 21 days of prayer and fasting as we seek God's direction for 2026. Daily devotionals, prayer meetings, and breakthrough sessions.",
    date: "January 20 - February 9, 2026",
    time: "6:00 AM & 7:00 PM Daily",
    location: "Sanctuary & Virtual (Zoom)",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
    category: "Prayer"
  },
  {
    id: "e2",
    title: "Youth Winter Retreat",
    description: "A transformative weekend for ages 13-18 featuring worship, teaching, outdoor activities, and life-changing encounters with God.",
    date: "February 14-16, 2026",
    time: "Friday 5:00 PM - Sunday 3:00 PM",
    location: "Mountain View Retreat Center",
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800",
    category: "Youth"
  },
  {
    id: "e3",
    title: "Marriage Enrichment Weekend",
    description: "Strengthen your marriage with practical tools, biblical wisdom, and quality time together. Includes childcare, meals, and couple's activities.",
    date: "February 21-23, 2026",
    time: "Friday 6:00 PM - Sunday 12:00 PM",
    location: "Church Campus & Offsite Venue",
    imageUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
    category: "Marriage"
  },
  {
    id: "e4",
    title: "Community Food Drive",
    description: "Help us serve 500+ families in need. Donate non-perishable items, volunteer to pack boxes, or sponsor a family for the month.",
    date: "March 1-15, 2026",
    time: "Drop-off: Mon-Sat 9:00 AM - 5:00 PM",
    location: "Main Campus - Fellowship Hall",
    imageUrl: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800",
    category: "Outreach"
  },
  {
    id: "e5",
    title: "Women's Empowerment Conference",
    description: "A powerful day of worship, teaching, and sisterhood. Guest speaker: Dr. Michelle Roberts. Theme: 'Daughters of Destiny'",
    date: "March 22, 2026",
    time: "9:00 AM - 4:00 PM",
    location: "Main Sanctuary",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    category: "Women"
  },
  {
    id: "e6",
    title: "Men's Breakfast & Leadership Summit",
    description: "Monthly gathering for men to connect, grow, and lead. Featuring breakfast, teaching on biblical manhood, and small group discussions.",
    date: "First Saturday Monthly",
    time: "8:00 AM - 11:00 AM",
    location: "Fellowship Hall",
    imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&q=80&w=800",
    category: "Men"
  },
  {
    id: "e7",
    title: "Easter Celebration Service",
    description: "Celebrate the resurrection with powerful worship, inspiring message, and special performances. Invite your family and friends!",
    date: "April 20, 2026",
    time: "9:00 AM & 11:00 AM Services",
    location: "Main Sanctuary",
    imageUrl: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&q=80&w=800",
    category: "Holiday"
  },
  {
    id: "e8",
    title: "Financial Freedom Workshop",
    description: "Learn biblical principles for managing money, eliminating debt, and building wealth. 6-week course with workbook and personal coaching.",
    date: "April 28 - June 2, 2026",
    time: "Tuesdays 7:00 PM - 9:00 PM",
    location: "Education Wing - Room 201",
    imageUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=800",
    category: "Training"
  },
  {
    id: "e9",
    title: "Kids Summer Camp",
    description: "A week of fun, faith, and friendship for ages 5-12. Daily themes, games, crafts, worship, and biblical teaching. Register early!",
    date: "June 23-27, 2026",
    time: "9:00 AM - 3:00 PM Daily",
    location: "Church Campus & Outdoor Facilities",
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&q=80&w=800",
    category: "Children"
  },
  {
    id: "e10",
    title: "Church Anniversary Celebration",
    description: "Join us as we celebrate 25 years of God's faithfulness! Special guest speakers, reunion service, dinner banquet, and testimonies.",
    date: "July 12-13, 2026",
    time: "Saturday 6:00 PM, Sunday 10:00 AM",
    location: "Main Sanctuary",
    imageUrl: "https://images.unsplash.com/photo-1464047736614-af63643285bf?auto=format&fit=crop&q=80&w=800",
    category: "Celebration"
  },
  {
    id: "e11",
    title: "Back to School Blessing",
    description: "Bring your students and backpacks for prayer, blessing, and free school supplies. Community event open to all families.",
    date: "August 10, 2026",
    time: "11:00 AM - 2:00 PM",
    location: "Main Campus Grounds",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=800",
    category: "Community"
  },
  {
    id: "e12",
    title: "Fall Leadership Conference",
    description: "Equipping ministry leaders and volunteers for excellence. Workshops on leadership, communication, team building, and spiritual growth.",
    date: "September 19-20, 2026",
    time: "Friday 6:00 PM - Saturday 4:00 PM",
    location: "Sanctuary & Breakout Rooms",
    imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=800",
    category: "Leadership"
  }
];


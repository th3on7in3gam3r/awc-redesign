export interface MediaItem {
    id: string;
    type: 'image' | 'video';
    url: string;
    thumbnail: string;
    title: string;
    category: string;
    description?: string;
}

export const galleryData: MediaItem[] = [
    {
        id: '1',
        type: 'image',
        url: '/images/home-hero.jpg',
        thumbnail: '/images/home-hero.jpg',
        title: 'Sunday Worship Experience',
        category: 'Worship',
        description: 'A powerful moment of praise and worship during our Sunday morning service.'
    },
    {
        id: '2',
        type: 'image',
        url: '/images/mens-ministry-1.jpg',
        thumbnail: '/images/mens-ministry-1.jpg',
        title: 'Men\'s Fellowship Breakfast',
        category: 'Ministries',
        description: 'Our brothers gathering for food, fellowship, and word.'
    },
    {
        id: '3',
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        thumbnail: '/images/worship-arts.png',
        title: 'Worship Arts Showcase',
        category: 'Worship',
        description: 'Highlights from our recent Worship Arts ministry performance.'
    },
    {
        id: '4',
        type: 'image',
        url: '/images/youth-ministry.png',
        thumbnail: '/images/youth-ministry.png',
        title: 'Youth Ignition Night',
        category: 'Youth',
        description: 'The next generation coming together to ignite their faith.'
    },
    {
        id: '5',
        type: 'image',
        url: '/images/womens-ministry.png',
        thumbnail: '/images/womens-ministry.png',
        title: 'Women of Grace Conference',
        category: 'Ministries',
        description: 'A weekend of empowerment and spiritual growth for women.'
    },
    {
        id: '6',
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Placeholder
        thumbnail: '/images/community-outreach.png',
        title: 'Community Impact Report',
        category: 'Community',
        description: 'Seeing the lives touched through our outreach programs.'
    },
    {
        id: '7',
        type: 'image',
        url: '/images/children-ministry.png',
        thumbnail: '/images/children-ministry.png',
        title: 'Kids Kingdom Adventures',
        category: 'Children',
        description: 'Where faith and fun meet for our little ones.'
    },
    {
        id: '8',
        type: 'image',
        url: '/images/mens-ministry-2.jpg',
        thumbnail: '/images/mens-ministry-2.jpg',
        title: 'Manhood & Mentorship',
        category: 'Ministries',
        description: 'Guiding the next generation of men in faith.'
    },
    {
        id: '9',
        type: 'image',
        url: '/images/pastors-hero.png',
        thumbnail: '/images/pastors-hero.png',
        title: 'Pastoral Vision Support',
        category: 'Leadership',
        description: 'Our team working together to fulfill the vision of the house.'
    },
    {
        id: '10',
        type: 'image',
        url: '/images/worship-arts.png',
        thumbnail: '/images/worship-arts.png',
        title: 'Anointed Worship',
        category: 'Worship',
        description: 'Leading the congregation into the presence of God.'
    },
    {
        id: '11',
        type: 'image',
        url: '/images/home-hero.jpg',
        thumbnail: '/images/home-hero.jpg',
        title: 'Sanctuary Moments',
        category: 'Worship',
        description: 'Finding peace and presence in the sanctuary.'
    },
    {
        id: '12',
        type: 'video',
        url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        thumbnail: '/images/youth-ministry.png',
        title: 'Next Gen Leaders',
        category: 'Youth',
        description: 'Developing the leaders of tomorrow.'
    },
    {
        id: '13',
        type: 'image',
        url: '/images/community-outreach.png',
        thumbnail: '/images/community-outreach.png',
        title: 'Love in Action',
        category: 'Community',
        description: 'Extending the love of Christ beyond our walls.'
    },
    {
        id: '14',
        type: 'image',
        url: '/images/children-ministry.png',
        thumbnail: '/images/children-ministry.png',
        title: 'Little Praisers',
        category: 'Children',
        description: 'The joy of worship in our children\'s ministry.'
    },
    {
        id: '15',
        type: 'image',
        url: '/images/womens-ministry.png',
        thumbnail: '/images/womens-ministry.png',
        title: 'Sisterhood Strong',
        category: 'Ministries',
        description: 'Women standing together in faith and purpose.'
    }
];

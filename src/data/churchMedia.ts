import type { MediaItem } from './galleryData';

export type ChurchMediaItem = MediaItem;

/** Local church photos imported from Drive — add more entries as new files land in public/. */
export const churchPhotos: ChurchMediaItem[] = [
  {
    id: 'church-img-3708',
    type: 'image',
    url: '/images/gallery/church/img-3708.jpg',
    thumbnail: '/images/gallery/church/img-3708.jpg',
    title: 'Hands Lifted in Worship',
    category: 'Worship',
    description: 'Young adults standing in prayer during Sunday worship.',
  },
  {
    id: 'church-dsc-3031',
    type: 'image',
    url: '/images/gallery/church/dsc-3031.jpg',
    thumbnail: '/images/gallery/church/dsc-3031.jpg',
    title: 'A Moment of Prayer',
    category: 'Worship',
    description: 'Congregants standing together in prayer during service.',
  },
  {
    id: 'church-dsc-2986',
    type: 'image',
    url: '/images/gallery/church/dsc-2986.jpg',
    thumbnail: '/images/gallery/church/dsc-2986.jpg',
    title: 'Fellowship Smile',
    category: 'Fellowship',
    description: 'Friends celebrating together at a church gathering.',
  },
  {
    id: 'church-dsc-2875',
    type: 'image',
    url: '/images/gallery/church/dsc-2875.jpg',
    thumbnail: '/images/gallery/church/dsc-2875.jpg',
    title: 'Standing in Faith',
    category: 'Worship',
    description: 'A multi-generational moment of prayer in the sanctuary.',
  },
  {
    id: 'church-dsc-1480',
    type: 'image',
    url: '/images/gallery/church/dsc-1480.jpg',
    thumbnail: '/images/gallery/church/dsc-1480.jpg',
    title: 'Joy on Stage',
    category: 'Fellowship',
    description: 'A joyful embrace during a special church celebration.',
  },
  {
    id: 'church-dsc-2862',
    type: 'image',
    url: '/images/gallery/church/dsc-2862.jpg',
    thumbnail: '/images/gallery/church/dsc-2862.jpg',
    title: 'United in Prayer',
    category: 'Worship',
    description: 'Family worshipping together with open hands and hearts.',
  },
];

/**
 * Local fellowship videos — add a Drive download under public/video/fellowship/
 * then append an entry here (thumbnail poster optional under public/images/gallery/church/).
 */
export const churchVideos: ChurchMediaItem[] = [
  {
    id: 'church-vid-wa0165',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0165.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0165-poster.jpg',
    title: 'All of My Worship',
    category: 'Fellowship',
    description: 'A worship leader lifting praise from the stage.',
  },
  {
    id: 'church-vid-wa0166',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0166.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0166-poster.jpg',
    title: 'Fellowship Moment',
    category: 'Fellowship',
    description: 'A short moment from church fellowship life.',
  },
  {
    id: 'church-vid-wa0168',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0168.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0168-poster.jpg',
    title: 'Church Family Highlights',
    category: 'Fellowship',
    description: 'Highlights from a recent gathering with the AWC family.',
  },
  {
    id: 'church-vid-wa0170',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0170.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0170-poster.jpg',
    title: 'Word on the Mic',
    category: 'Fellowship',
    description: 'A powerful moment of teaching and encouragement.',
  },
  {
    id: 'church-vid-wa0171',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0171.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0171-poster.jpg',
    title: 'Voices Lifted Together',
    category: 'Fellowship',
    description: 'Worshippers singing together with hearts open.',
  },
  {
    id: 'church-vid-wa0172',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0172.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0172-poster.jpg',
    title: "'26 Youth Conference",
    category: 'Fellowship',
    description: 'Highlights from the Anointed Worship Centers Youth Conference.',
  },
  {
    id: 'church-vid-wa0173',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0173.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0173-poster.jpg',
    title: 'Preaching with Fire',
    category: 'Fellowship',
    description: 'The Word proclaimed with passion from the pulpit.',
  },
  {
    id: 'church-vid-wa0175',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0175.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0175-poster.jpg',
    title: 'Cross and Clouds',
    category: 'Fellowship',
    description: 'A message moment against a backdrop of light and the cross.',
  },
  {
    id: 'church-vid-wa0176',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0176.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0176-poster.jpg',
    title: 'Song of Praise',
    category: 'Fellowship',
    description: 'A heartfelt worship song from the AWC stage.',
  },
  {
    id: 'church-vid-wa0177',
    type: 'video',
    url: '/video/fellowship/vid-20260830-wa0177.mp4',
    thumbnail: '/images/gallery/church/vid-20260830-wa0177-poster.jpg',
    title: 'Keys and Drums',
    category: 'Fellowship',
    description: 'The band leading worship with energy and joy.',
  },
];

export const allChurchMedia: ChurchMediaItem[] = [...churchPhotos, ...churchVideos];

export function isNativeVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

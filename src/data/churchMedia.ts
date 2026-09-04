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
];

export const allChurchMedia: ChurchMediaItem[] = [...churchPhotos, ...churchVideos];

export function isNativeVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg)(\?|$)/i.test(url);
}

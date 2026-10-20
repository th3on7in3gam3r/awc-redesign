import type { MediaItem } from './galleryData';
import { PIXIESET_SNAPSHOT } from './pixiesetSnapshot';

/** Leah's public Pixieset collection for AWC (shared with permission). */
export const PIXIESET_GALLERY_URL = 'https://leah6583.pixieset.com/anointedworshipcenter/';
export const PIXIESET_CREDIT = 'Leah';
export const PIXIESET_CATEGORY = 'Photography';

const IMAGE_BASE = 'https://images.pixieset.com/518922221';

/** Hand-picked shots for the gallery hero, by Pixieset image key. */
export const PIXIESET_HERO_KEYS = [
  '4209bd57537edacf90493733f6b08896', // worship team before the cross (wide)
  'cec35e548556cab069e30142a0073f61', // arms open in worship (tall)
  '337b50ae8c1ba0b0188be60e24ea0c9c', // children's ministry
  '81fce6d3bded9b3a2498250d3a775642', // embrace, black & white
];

const credit = { name: PIXIESET_CREDIT, url: PIXIESET_GALLERY_URL };

/** Same shape the /api/gallery/pixieset route returns, built from the committed snapshot. */
export const pixiesetSnapshotPhotos: MediaItem[] = PIXIESET_SNAPSHOT.map(([, width, height, key]) => ({
  id: `pixieset-${key}`,
  type: 'image',
  url: `${IMAGE_BASE}/${key}-xlarge.jpg`,
  thumbnail: `${IMAGE_BASE}/${key}-medium.jpg`,
  title: 'Anointed Worship Center',
  category: PIXIESET_CATEGORY,
  width,
  height,
  credit,
}));

/**
 * Fetches Leah's gallery through our API (which syncs with Pixieset and caches for an hour).
 * Falls back to the committed snapshot if the API is unavailable or returns nothing.
 */
export async function loadPixiesetPhotos(): Promise<MediaItem[]> {
  try {
    const res = await fetch('/api/gallery/pixieset');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const items: MediaItem[] = Array.isArray(data?.items) ? data.items : [];
    if (items.length === 0) return pixiesetSnapshotPhotos;
    return items.map((item) => ({ ...item, credit }));
  } catch (err) {
    console.warn('Pixieset sync unavailable, using snapshot:', err);
    return pixiesetSnapshotPhotos;
  }
}

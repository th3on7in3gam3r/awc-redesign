import type { MediaItem } from './galleryData';
import { PIXIESET_SNAPSHOT } from './pixiesetSnapshot';

/** Leah's public Pixieset collection for AWC (shared with permission). */
export const PIXIESET_GALLERY_URL = 'https://leah6583.pixieset.com/anointedworshipcenter/';
export const PIXIESET_CREDIT = 'Leah';

const IMAGE_BASE = 'https://images.pixieset.com/518922221';

export const PIXIESET_CATEGORY = 'Photography';

/** Same shape the /api/gallery/pixieset route returns, built from the committed snapshot. */
export const pixiesetSnapshotPhotos: MediaItem[] = PIXIESET_SNAPSHOT.map(([name, , , key]) => ({
  id: `pixieset-${key}`,
  type: 'image',
  url: `${IMAGE_BASE}/${key}-xlarge.jpg`,
  thumbnail: `${IMAGE_BASE}/${key}-medium.jpg`,
  title: 'Anointed Worship Center',
  category: PIXIESET_CATEGORY,
  description: `Photo by ${PIXIESET_CREDIT} · ${name}`,
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
    return items.length > 0 ? items : pixiesetSnapshotPhotos;
  } catch (err) {
    console.warn('Pixieset sync unavailable, using snapshot:', err);
    return pixiesetSnapshotPhotos;
  }
}

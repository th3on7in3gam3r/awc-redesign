import { AWC_VAULT_EVENTS_API, AWC_VAULT_FELLOWSHIP_COOKOUT_URL } from '../constants';
import { ChurchEvent } from '../types';

const DEFAULT_EVENT_IMAGE =
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800';

export interface VaultEventRecord {
  id: string;
  name: string;
  date: string;
  type: string;
  location?: string | null;
  time?: string | null;
  description?: string | null;
  starts_at?: string | null;
  end_time?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

function parseLocalDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
  return new Date(year, month - 1, day);
}

function normalizeEventDate(dateStr: string): string {
  return dateStr.split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  return parseLocalDate(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatTimeRange(time?: string | null, endTime?: string | null): string {
  if (!time) return 'Time TBA';
  return endTime ? `${time} - ${endTime}` : time;
}

function resolveSignupUrl(event: VaultEventRecord): string | undefined {
  const haystack = `${event.name} ${event.type} ${event.description ?? ''}`.toLowerCase();
  if (haystack.includes('cookout') || haystack.includes('fellowship-cookout')) {
    return AWC_VAULT_FELLOWSHIP_COOKOUT_URL;
  }
  return undefined;
}

export function mapVaultEventToChurchEvent(event: VaultEventRecord): ChurchEvent {
  return {
    id: event.id,
    title: event.name,
    description: event.description?.trim() || 'Join us for this upcoming gathering at Anointed Worship Center.',
    date: formatDisplayDate(event.date),
    time: formatTimeRange(event.time, event.end_time),
    location: event.location?.trim() || 'Main Campus',
    imageUrl: event.image_url || DEFAULT_EVENT_IMAGE,
    category: event.type || 'Event',
    eventDate: normalizeEventDate(event.date),
    endTime: event.end_time,
    signupUrl: resolveSignupUrl(event),
    createdAt: event.created_at ?? undefined,
  };
}

function isCookoutLike(event: ChurchEvent): boolean {
  const haystack = `${event.title} ${event.category} ${event.description}`.toLowerCase();
  return haystack.includes('cookout') || haystack.includes('fellowship');
}

function isDefaultImage(url: string): boolean {
  return url === DEFAULT_EVENT_IMAGE;
}

function pickBestCookoutImage(cookouts: ChurchEvent[]): string {
  const vaultImage = cookouts.find((event) => event.imageUrl.includes('supabase.co'));
  if (vaultImage) return vaultImage.imageUrl;

  const customImage = cookouts.find((event) => !isDefaultImage(event.imageUrl));
  return customImage?.imageUrl ?? cookouts[0].imageUrl;
}

function mergeSameDayCookouts(cookouts: ChurchEvent[]): ChurchEvent {
  const sorted = [...cookouts].sort((a, b) => {
    const aFellowship = a.title.toLowerCase().includes('fellowship cookout') ? 1 : 0;
    const bFellowship = b.title.toLowerCase().includes('fellowship cookout') ? 1 : 0;
    if (aFellowship !== bFellowship) return bFellowship - aFellowship;

    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });

  const primary = sorted[0];

  return {
    ...primary,
    imageUrl: pickBestCookoutImage(cookouts),
    signupUrl: primary.signupUrl ?? cookouts.find((event) => event.signupUrl)?.signupUrl,
  };
}

export function deduplicateSameDayCookouts(events: ChurchEvent[]): ChurchEvent[] {
  const grouped = new Map<string, ChurchEvent[]>();

  for (const event of events) {
    const key = event.eventDate ?? event.id;
    const bucket = grouped.get(key) ?? [];
    bucket.push(event);
    grouped.set(key, bucket);
  }

  const merged: ChurchEvent[] = [];

  for (const group of grouped.values()) {
    const cookouts = group.filter(isCookoutLike);

    if (cookouts.length > 1) {
      merged.push(...group.filter((event) => !isCookoutLike(event)));
      merged.push(mergeSameDayCookouts(cookouts));
      continue;
    }

    merged.push(...group);
  }

  return sortEvents(merged);
}

function sortEvents(events: ChurchEvent[]): ChurchEvent[] {
  return [...events].sort((a, b) => {
    const aDate = a.eventDate ? parseLocalDate(a.eventDate).getTime() : 0;
    const bDate = b.eventDate ? parseLocalDate(b.eventDate).getTime() : 0;
    return aDate - bDate;
  });
}

export async function fetchVaultEvents(): Promise<ChurchEvent[]> {
  const response = await fetch(AWC_VAULT_EVENTS_API);
  if (!response.ok) {
    throw new Error(`Vault events request failed (${response.status})`);
  }

  const payload = await response.json();
  const records: VaultEventRecord[] = Array.isArray(payload?.events) ? payload.events : [];

  return sortEvents(records.map(mapVaultEventToChurchEvent));
}

export function getEventsForDay(events: ChurchEvent[], day: Date): ChurchEvent[] {
  return events.filter((event) => {
    if (!event.eventDate) return false;
    const eventDay = parseLocalDate(event.eventDate);
    return (
      eventDay.getFullYear() === day.getFullYear() &&
      eventDay.getMonth() === day.getMonth() &&
      eventDay.getDate() === day.getDate()
    );
  });
}

export function getUpcomingEvents(events: ChurchEvent[]): ChurchEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return events.filter((event) => {
    if (!event.eventDate) return false;
    return parseLocalDate(event.eventDate).getTime() >= today.getTime();
  });
}

export function getDeduplicatedEvents(events: ChurchEvent[]): ChurchEvent[] {
  return deduplicateSameDayCookouts(events);
}

export function getPublicDisplayEvents(events: ChurchEvent[]): ChurchEvent[] {
  return getUpcomingEvents(getDeduplicatedEvents(events));
}

/** Calendar month view — all deduped events in the month (matches Vault), hiding fully past months. */
export function getMonthDisplayEvents(events: ChurchEvent[], month: Date): ChurchEvent[] {
  const deduped = getDeduplicatedEvents(events);
  const year = month.getFullYear();
  const monthIndex = month.getMonth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const monthEnd = new Date(year, monthIndex + 1, 0);
  if (monthEnd.getTime() < today.getTime()) return [];

  return deduped.filter((event) => {
    if (!event.eventDate) return false;
    const eventDay = parseLocalDate(event.eventDate);
    return eventDay.getFullYear() === year && eventDay.getMonth() === monthIndex;
  });
}

export function getCalendarDays(currentDate: Date): Date[] {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const start = new Date(firstDay);
  start.setDate(start.getDate() - start.getDay());

  const end = new Date(lastDay);
  end.setDate(end.getDate() + (6 - end.getDay()));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

export type Track = { id: string; title: string; number: number; note?: string; src: string; duration: number };

export const fmt = (s: number) => {
  if (!isFinite(s) || s <= 0) return '0:00';
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
};

/** Demo songs, shown only until the first real upload. */
const H = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-';
const MOCK: Omit<Track, 'duration'>[] = [
  { id: 'm1', number: 1, title: 'Humming in the Kitchen', note: 'The first one I ever recorded, while you stirred the tea.', src: `${H}1.mp3` },
  { id: 'm2', number: 2, title: 'Soft Light, Sunday', note: 'Rain on the window. You thought I was asleep.', src: `${H}8.mp3` },
  { id: 'm3', number: 3, title: 'Moonlit Balcony', note: 'For the nights that felt too long.', src: `${H}3.mp3` },
];

/** Read audio length without playing it (6s timeout). */
export const probe = (src: string) =>
  new Promise<number>((resolve) => {
    const a = new Audio();
    const done = (n: number) => { a.onloadedmetadata = a.onerror = null; resolve(isFinite(n) ? n : 0); };
    a.preload = 'metadata';
    a.onloadedmetadata = () => done(a.duration);
    a.onerror = () => done(0);
    setTimeout(() => done(0), 6000);
    a.src = src;
  });

/** Songs uploaded by the admin, shared with every visitor (empty list on any failure). */
export async function loadUploaded(): Promise<Track[]> {
  try {
    const r = await fetch('/api/tracks', { cache: 'no-store' });
    const rows: Track[] = r.ok ? await r.json() : [];
    return rows.sort((a, b) => a.number - b.number);
  } catch { return []; }
}

export async function loadTracks(): Promise<Track[]> {
  const real = await loadUploaded();
  if (real.length) return real;
  return Promise.all(MOCK.map(async (t) => ({ ...t, duration: await probe(t.src) })));
}

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

/* ---------- Songs are saved in this browser (IndexedDB), no server needed ---------- */
const open = () =>
  new Promise<IDBDatabase>((res, rej) => {
    const r = indexedDB.open('sanctuary', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('tracks', { keyPath: 'id' });
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });

async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await open();
  return new Promise<T>((res, rej) => {
    const q = fn(db.transaction('tracks', mode).objectStore('tracks'));
    q.onsuccess = () => res(q.result);
    q.onerror = () => rej(q.error);
  });
}

export async function loadLocal(): Promise<Track[]> {
  try {
    const rows = await run<any[]>('readonly', (s) => s.getAll());
    return rows.map((r) => ({ ...r.meta, src: URL.createObjectURL(r.blob) })).sort((a, b) => a.number - b.number);
  } catch { return []; }
}

export const saveTrack = (meta: Omit<Track, 'src'>, file: File) =>
  run('readwrite', (s) => s.put({ id: meta.id, meta, blob: file }));

export const deleteTrack = (id: string) => run('readwrite', (s) => s.delete(id));

export async function loadTracks(): Promise<Track[]> {
  const mine = await loadLocal();
  if (mine.length) return mine;
  return Promise.all(MOCK.map(async (t) => ({ ...t, duration: await probe(t.src) })));
}

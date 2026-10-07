'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, LogOut, Music, Trash2, Upload } from 'lucide-react';
import { ADMIN_ID, ADMIN_PASSWORD } from '@/lib/config';
import { deleteTrack, fmt, loadLocal, probe, saveTrack, type Track } from '@/lib/tracks';

const KEY = 'sanctuary-admin';
const field = 'w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-lg outline-none transition-all duration-300 focus:bg-white';
const card = 'rounded-3xl border border-white/70 bg-white/50 p-6 shadow-warm backdrop-blur-md';

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { try { setOk(localStorage.getItem(KEY) === '1'); } catch { setOk(false); } }, []);
  if (ok === null) return null;
  const set = (v: boolean) => { try { v ? localStorage.setItem(KEY, '1') : localStorage.removeItem(KEY); } catch {} setOk(v); };
  return ok ? <Panel onLogout={() => set(false)} /> : <Login onOk={() => set(true)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const go = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.trim().toLowerCase() === ADMIN_ID && pw === ADMIN_PASSWORD) onOk(); else setErr('Wrong ID or password. Try again.');
  };
  return (
    <main className="mx-auto grid min-h-screen max-w-sm place-items-center px-5">
      <form onSubmit={go} className={`${card} w-full space-y-4 p-8`}>
        <Lock className="text-taupe" />
        <h1 className="font-serif text-3xl">Admin login</h1>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Login ID" aria-label="Login ID" autoComplete="username" className={field} />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" aria-label="Password" autoComplete="current-password" className={field} />
        {err && <p role="alert" className="text-sm text-taupe">{err}</p>}
        <button className="w-full rounded-2xl bg-ink py-3 text-lg text-cream transition-all duration-300 hover:opacity-90">Log in</button>
        <Link href="/" className="block text-center text-sm text-taupe underline">Back to the songs</Link>
      </form>
    </main>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [songs, setSongs] = useState<Track[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState(''); const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false); const [msg, setMsg] = useState(''); const [saved, setSaved] = useState(false);
  const refresh = () => loadLocal().then(setSongs);
  useEffect(() => { refresh(); }, []);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; setSaved(false); setMsg('');
    if (!f) return;
    if (!/\.(mp3|wav|m4a)$/i.test(f.name)) { setFile(null); return setMsg('Please choose an .mp3, .wav or .m4a file.'); }
    setFile(f); setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')); // name from the file, she can change it
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file) return;
    setBusy(true); setMsg('');
    try {
      const u = URL.createObjectURL(file); const duration = await probe(u); URL.revokeObjectURL(u);
      if (!duration) throw new Error('unreadable');
      const number = Math.max(0, ...songs.map((s) => s.number)) + 1;
      await saveTrack({ id: Date.now().toString(36) + Math.random().toString(36).slice(2), title: title.trim() || 'Untitled', number, note: note.trim(), duration }, file);
      setFile(null); setTitle(''); setNote(''); setSaved(true); await refresh();
    } catch { setMsg("We couldn't save that file. Try another .mp3, .wav or .m4a."); }
    setBusy(false);
  };

  return (
    <main className="mx-auto max-w-xl px-5 py-12">
      <div className="flex items-center justify-between text-sm text-taupe">
        <Link href="/" className="underline">Back to the songs</Link>
        <button onClick={onLogout} className="flex items-center gap-1 underline"><LogOut size={14} /> Log out</button>
      </div>
      <h1 className="mb-6 mt-3 font-serif text-4xl">Add a song</h1>

      <form onSubmit={submit} className={`${card} space-y-5`}>
        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed border-taupe/40 bg-white/40 px-4 py-8 text-center transition-all duration-300 hover:bg-white/70 focus-within:ring-2 focus-within:ring-taupe">
          <input type="file" accept=".mp3,.wav,.m4a,audio/*" onChange={pick} className="sr-only" />
          <Music className="text-taupe" />
          <span className="text-lg font-medium">{file ? file.name : 'Tap here to choose a song'}</span>
          <span className="text-sm text-taupe">{file ? 'Tap again to pick a different one' : 'mp3, wav or m4a'}</span>
        </label>
        {file && (
          <>
            <label className="block"><span className="mb-1 block text-sm text-taupe">Song name</span>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className={field} /></label>
            <label className="block"><span className="mb-1 block text-sm text-taupe">A little note (optional)</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className={field} /></label>
            <button disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-lg text-cream transition-all duration-300 hover:opacity-90 disabled:opacity-50">
              <Upload size={20} /> {busy ? 'Saving…' : 'Upload song'}
            </button>
          </>
        )}
        {msg && <p role="alert" className="text-taupe">{msg}</p>}
        {saved && <p role="status" className="flex items-center gap-2 text-ink"><CheckCircle2 size={20} className="text-taupe" /> Saved! <Link href="/" className="underline">See it on the website</Link></p>}
      </form>

      <h2 className="mb-3 mt-10 font-serif text-2xl">Your songs</h2>
      {songs.length === 0 ? <p className="text-taupe">Nothing here yet. Your first song will show up here.</p> : (
        <ul className="space-y-2" aria-label="Your songs">
          {songs.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
              <span className="min-w-0 truncate">{t.title} <span className="text-sm text-taupe">{fmt(t.duration)}</span></span>
              <button aria-label={`Delete ${t.title}`} onClick={async () => { if (confirm(`Delete "${t.title}"?`)) { await deleteTrack(t.id); refresh(); } }}
                className="ml-3 text-taupe transition-all duration-300 hover:text-ink"><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-8 text-sm text-taupe">Songs are saved on this device and browser. Use the same phone or computer to see them again.</p>
    </main>
  );
}

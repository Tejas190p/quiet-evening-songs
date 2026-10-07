'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Lock, LogOut, Music, Trash2, Upload } from 'lucide-react';
import { upload } from '@vercel/blob/client';
import { fmt, loadUploaded, probe, type Track } from '@/lib/tracks';

const field = 'w-full rounded-2xl border border-white/70 bg-white/60 px-4 py-3 text-lg outline-none transition-all duration-300 focus:bg-white';
const card = 'rounded-3xl border border-white/70 bg-white/50 p-6 shadow-warm backdrop-blur-md';
const JSON_H = { 'Content-Type': 'application/json' };
const MIME: Record<string, string> = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4' };

export default function Admin() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => { fetch('/api/login', { cache: 'no-store' }).then((r) => r.json()).then((d) => setOk(!!d.admin)).catch(() => setOk(false)); }, []);
  if (ok === null) return null;
  const logout = async () => { await fetch('/api/login', { method: 'DELETE' }); setOk(false); };
  return ok ? <Panel onLogout={logout} /> : <Login onOk={() => setOk(true)} />;
}

function Login({ onOk }: { onOk: () => void }) {
  const [id, setId] = useState(''); const [pw, setPw] = useState(''); const [err, setErr] = useState(''); const [busy, setBusy] = useState(false);
  const go = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr('');
    const r = await fetch('/api/login', { method: 'POST', headers: JSON_H, body: JSON.stringify({ id, password: pw }) }).catch(() => null);
    setBusy(false);
    if (r?.ok) onOk(); else setErr(r ? 'Wrong ID or password. Try again.' : 'Could not reach the website. Try again.');
  };
  return (
    <main className="mx-auto grid min-h-screen max-w-sm place-items-center px-5">
      <form onSubmit={go} className={`${card} w-full space-y-4 p-8`}>
        <Lock className="text-taupe" />
        <h1 className="font-serif text-3xl">Admin login</h1>
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Login ID" aria-label="Login ID" autoComplete="username" className={field} />
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="Password" aria-label="Password" autoComplete="current-password" className={field} />
        {err && <p role="alert" className="text-sm text-taupe">{err}</p>}
        <button disabled={busy} className="w-full rounded-2xl bg-ink py-3 text-lg text-cream transition-all duration-300 hover:opacity-90 disabled:opacity-50">{busy ? 'Checking…' : 'Log in'}</button>
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
  const refresh = () => loadUploaded().then(setSongs);
  useEffect(() => { refresh(); }, []);

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; setSaved(false); setMsg('');
    if (!f) return;
    if (!/\.(mp3|wav|m4a)$/i.test(f.name)) { setFile(null); return setMsg('Please choose an .mp3, .wav or .m4a file.'); }
    setFile(f); setTitle(f.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ')); // name comes from the file, she can change it
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!file) return;
    setBusy(true); setSaved(false); setMsg('Uploading… please keep this page open.');
    try {
      const u = URL.createObjectURL(file); const duration = await probe(u); URL.revokeObjectURL(u);
      const ext = file.name.split('.').pop()!.toLowerCase();
      const blob = await upload(`songs/${Date.now()}-${file.name.replace(/[^\w.-]+/g, '_')}`, file, {
        access: 'public', handleUploadUrl: '/api/upload', contentType: MIME[ext] || 'audio/mpeg',
      });
      const number = Math.max(0, ...songs.map((s) => s.number)) + 1;
      const r = await fetch('/api/tracks', { method: 'POST', headers: JSON_H, body: JSON.stringify({ title: title.trim() || 'Untitled', number, note: note.trim(), src: blob.url, duration }) });
      if (!r.ok) throw new Error('save');
      setFile(null); setTitle(''); setNote(''); setMsg(''); setSaved(true); await refresh();
    } catch { setMsg('Upload failed. Check your internet and try again. If it keeps failing, Blob storage may not be connected in Vercel.'); }
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
              <Upload size={20} /> {busy ? 'Uploading…' : 'Upload song'}
            </button>
          </>
        )}
        {msg && <p role="status" className="text-taupe">{msg}</p>}
        {saved && <p role="status" className="flex items-center gap-2"><CheckCircle2 size={20} className="text-taupe" /> Saved! Everyone can hear it now. <Link href="/" className="underline">See it</Link></p>}
      </form>

      <h2 className="mb-3 mt-10 font-serif text-2xl">Your songs</h2>
      {songs.length === 0 ? <p className="text-taupe">Nothing here yet. Your first song will show up here.</p> : (
        <ul className="space-y-2" aria-label="Your songs">
          {songs.map((t) => (
            <li key={t.id} className="flex items-center justify-between rounded-2xl bg-white/50 px-4 py-3">
              <span className="min-w-0 truncate">{t.title} <span className="text-sm text-taupe">{fmt(t.duration)}</span></span>
              <button aria-label={`Delete ${t.title}`} onClick={async () => { if (confirm(`Delete "${t.title}" for everyone?`)) { await fetch(`/api/tracks?id=${t.id}`, { method: 'DELETE' }); refresh(); } }}
                className="ml-3 text-taupe transition-all duration-300 hover:text-ink"><Trash2 size={18} /></button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

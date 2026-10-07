'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { loadTracks, type Track } from '@/lib/tracks';
import { useAudio } from '@/lib/useAudio';
import TrackRow from '@/components/TrackRow';
import PlayerBar from '@/components/PlayerBar';

// Edit these words and drop a photo at /public/portrait.jpg
const SITE = {
  hangul: '보라해',
  title: 'Songs for a Quiet Evening',
  titleKr: '조용한 밤의 노래',
  blurb: 'A small purple room I built to keep your voice in. Press play, get comfortable, and stay as long as you like.',
};

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [ready, setReady] = useState(false);
  const [noPhoto, setNoPhoto] = useState(false);
  useEffect(() => {
    const load = () => loadTracks().then(setTracks).finally(() => setReady(true));
    load();
    const onShow = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onShow);
    return () => document.removeEventListener('visibilitychange', onShow);
  }, []);
  const a = useAudio(tracks);
  const current = tracks.find((t) => t.id === a.id);

  return (
    <main className={`mx-auto max-w-3xl px-5 pt-14 sm:pt-24 ${current ? 'pb-48' : 'pb-24'}`}>
      <header className="mb-12 flex flex-col items-center text-center sm:mb-16">
        <div className="mb-8 h-36 w-36 overflow-hidden rounded-full border-4 border-white/80 bg-gradient-to-br from-rose to-sage shadow-warm ring-4 ring-sage/60 sm:h-44 sm:w-44">
          {noPhoto
            ? <div className="grid h-full w-full place-items-center text-taupe"><Heart size={36} fill="currentColor" /></div>
            // eslint-disable-next-line @next/next/no-img-element
            : <img src="/portrait.jpg" alt="Portrait" className="h-full w-full object-cover" onError={() => setNoPhoto(true)} />}
        </div>
        <p className="flex items-center gap-2 font-serif text-3xl text-taupe">
          {SITE.hangul} <Heart size={22} fill="currentColor" aria-hidden />
        </p>
        <h1 className="mt-2 font-serif text-4xl font-medium leading-tight sm:text-6xl">{SITE.title}</h1>
        <p className="mt-2 font-serif text-xl tracking-wide text-taupe">{SITE.titleKr}</p>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink/80">{SITE.blurb}</p>
      </header>

      {!ready ? (
        <p className="text-center text-taupe" role="status">Gathering the songs…</p>
      ) : (
        <ul className="space-y-3 sm:space-y-4" aria-label="Songs">
          {tracks.map((t) => (
            <TrackRow key={t.id} track={t} active={t.id === a.id} playing={a.playing} onPlay={() => a.play(t.id)} />
          ))}
        </ul>
      )}
      <p className="mt-16 text-center font-serif text-taupe">보라해 · I purple you<br /><Link href="/admin" className="font-sans text-xs underline opacity-70">Admin</Link></p>
      <PlayerBar a={a} track={current} />
    </main>
  );
}

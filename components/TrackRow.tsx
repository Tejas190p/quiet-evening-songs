'use client';
import { Pause, Play } from 'lucide-react';
import { fmt, type Track } from '@/lib/tracks';

export default function TrackRow({ track, active, playing, onPlay }: { track: Track; active: boolean; playing: boolean; onPlay: () => void }) {
  return (
    <li>
      <button
        onClick={onPlay}
        aria-label={`${active && playing ? 'Pause' : 'Play'} ${track.title}`}
        aria-pressed={active && playing}
        className={`group flex w-full items-center gap-4 rounded-3xl border p-4 text-left backdrop-blur-md transition-all duration-300 sm:gap-5 sm:p-5
          ${active ? 'border-white bg-white/80 shadow-warm' : 'border-white/50 bg-white/40 shadow-sm hover:bg-white/70 hover:shadow-lg hover:shadow-taupe/20'}`}
      >
        {/* Vinyl disc: spins while this track plays */}
        <span className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-ink/90 to-taupe shadow-md ${active && playing ? 'animate-spin-slow' : ''}`}>
          <span className="absolute inset-[7px] rounded-full border border-white/10" />
          <span className="h-4 w-4 rounded-full bg-rose" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-serif text-xl leading-tight sm:text-2xl">{track.title}</span>
          {track.note && <span className="mt-0.5 block truncate text-sm italic text-taupe">{track.note}</span>}
        </span>
        {active && playing && <span className="eq" aria-hidden><span /><span /><span /></span>}
        <span className="hidden text-sm tabular-nums text-taupe sm:block">{track.duration ? fmt(track.duration) : ''}</span>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sage text-ink transition-all duration-300 group-hover:scale-105">
          {active && playing ? <Pause size={18} /> : <Play size={18} className="translate-x-px" />}
        </span>
      </button>
    </li>
  );
}

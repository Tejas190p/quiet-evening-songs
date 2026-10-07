'use client';
import { AlertCircle, Loader2, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { fmt, type Track } from '@/lib/tracks';
import type { AudioState } from '@/lib/useAudio';

export default function PlayerBar({ a, track }: { a: AudioState; track?: Track }) {
  if (!track) return null;
  return (
    <div role="region" aria-label="Audio player" className="fixed inset-x-0 bottom-0 z-40 p-3 sm:p-5">
      <div className="mx-auto max-w-3xl rounded-3xl border border-white/70 bg-cream/80 p-4 shadow-warm backdrop-blur-md">
        {a.error && (
          <div role="alert" className="mb-3 flex items-center gap-2 rounded-2xl bg-rose/60 px-3 py-2 text-sm">
            <AlertCircle size={16} /> <span className="flex-1">{a.error}</span>
            <button onClick={a.retry} className="font-medium underline">Try again</button>
          </div>
        )}
        <div className="flex items-center gap-4">
          <button
            onClick={() => a.play(track.id)}
            aria-label={a.playing ? 'Pause' : 'Play'}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-ink text-cream shadow-md transition-all duration-300 hover:scale-105"
          >
            {a.loading ? <Loader2 size={20} className="animate-spin" /> : a.playing ? <Pause size={20} /> : <Play size={20} className="translate-x-px" />}
          </button>
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-lg leading-tight">{track.title}</p>
            <div className="flex items-center gap-2 text-xs tabular-nums text-taupe">
              <span className="w-9 text-right">{fmt(a.time)}</span>
              <input
                type="range" min={0} max={a.dur || 0} step={0.1} value={Math.min(a.time, a.dur || 0)}
                onChange={(e) => a.seek(+e.target.value)} aria-label="Seek" disabled={!a.dur}
                className="h-1 flex-1"
              />
              <span className="w-9">{fmt(a.dur)}</span>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <button onClick={a.toggleMute} aria-label={a.muted ? 'Unmute' : 'Mute'} className="text-taupe transition-all duration-300 hover:text-ink">
              {a.muted || a.volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input type="range" min={0} max={1} step={0.01} value={a.muted ? 0 : a.volume} onChange={(e) => a.setVolume(+e.target.value)} aria-label="Volume" className="w-20" />
          </div>
        </div>
      </div>
    </div>
  );
}

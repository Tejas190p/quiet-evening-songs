'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Track } from './tracks';

/** One shared <audio> element with loading / error / buffering state. */
export function useAudio(tracks: Track[]) {
  const el = useRef<HTMLAudioElement | null>(null);
  const list = useRef(tracks); list.current = tracks;
  const [id, setId] = useState<string | null>(null);
  const idRef = useRef<string | null>(null); idRef.current = id;
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [time, setTime] = useState(0);
  const [dur, setDur] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);

  const play = useCallback((tid: string) => {
    const a = el.current; const t = list.current.find((x) => x.id === tid);
    if (!a || !t) return;
    if (idRef.current === tid && !error) { a.paused ? a.play().catch(() => {}) : a.pause(); return; }
    setId(tid); setError(null); setLoading(true); setTime(0); setDur(t.duration || 0);
    a.src = t.src; a.play().catch(() => {});
  }, [error]);

  useEffect(() => {
    const a = new Audio(); a.preload = 'auto'; a.volume = 0.8; el.current = a;
    const on = (e: string, f: () => void) => a.addEventListener(e, f);
    on('timeupdate', () => setTime(a.currentTime));
    on('loadedmetadata', () => isFinite(a.duration) && setDur(a.duration));
    on('playing', () => { setPlaying(true); setLoading(false); setError(null); });
    on('pause', () => setPlaying(false));
    on('waiting', () => setLoading(true));
    on('canplay', () => setLoading(false));
    on('stalled', () => setLoading(true));
    on('ended', () => {
      const i = list.current.findIndex((t) => t.id === idRef.current);
      const n = list.current[i + 1];
      if (n) { setId(n.id); setTime(0); a.src = n.src; a.play().catch(() => {}); } else setPlaying(false);
    });
    on('error', () => {
      setLoading(false); setPlaying(false);
      setError(navigator.onLine ? "This recording can't be played in your browser." : 'You appear to be offline. Reconnect and try again.');
    });
    return () => { a.pause(); a.removeAttribute('src'); a.load(); };
  }, []);

  const seek = (t: number) => { if (el.current) { el.current.currentTime = t; setTime(t); } };
  const setVolume = (v: number) => { setVolumeState(v); if (el.current) { el.current.volume = v; el.current.muted = false; } setMuted(false); };
  const toggleMute = () => { if (el.current) { el.current.muted = !el.current.muted; setMuted(el.current.muted); } };
  const retry = () => {
    const a = el.current; if (!a) return;
    setError(null); setLoading(true); a.load(); a.play().catch(() => {});
  };

  return { id, playing, loading, error, time, dur, volume, muted, play, seek, setVolume, toggleMute, retry };
}
export type AudioState = ReturnType<typeof useAudio>;

import { NextResponse } from 'next/server';
import { del, list, put } from '@vercel/blob';
import { isAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const deny = () => NextResponse.json({ error: 'Not authorized' }, { status: 401 });

// Public: every visitor gets the full song list (one small JSON file per song in "meta/").
export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'meta/' });
    const rows = await Promise.all(blobs.map((b) => fetch(b.url, { cache: 'no-store' }).then((r) => r.json())));
    return NextResponse.json(rows);
  } catch { return NextResponse.json([]); }
}

// Admin only: save a song's details after its audio is uploaded.
export async function POST(req: Request) {
  if (!isAdmin()) return deny();
  const b = await req.json().catch(() => null);
  let host = '';
  try { host = new URL(b?.src).hostname; } catch {}
  if (!b?.title || !host.endsWith('.public.blob.vercel-storage.com')) return NextResponse.json({ error: 'Invalid song' }, { status: 400 });
  const meta = {
    id: crypto.randomUUID(), title: String(b.title).slice(0, 120), number: Number(b.number) || 1,
    note: String(b.note || '').slice(0, 300), src: b.src, duration: Number(b.duration) || 0,
  };
  await put(`meta/${meta.id}.json`, JSON.stringify(meta), { access: 'public', addRandomSuffix: false, contentType: 'application/json' });
  return NextResponse.json(meta);
}

// Admin only: remove a song and its audio file.
export async function DELETE(req: Request) {
  if (!isAdmin()) return deny();
  const id = new URL(req.url).searchParams.get('id') || '';
  if (!/^[0-9a-f-]{36}$/.test(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  const { blobs } = await list({ prefix: `meta/${id}.json` });
  if (blobs[0]) {
    const meta = await fetch(blobs[0].url, { cache: 'no-store' }).then((r) => r.json()).catch(() => null);
    await del([blobs[0].url, ...(meta?.src ? [meta.src] : [])]);
  }
  return NextResponse.json({ ok: true });
}

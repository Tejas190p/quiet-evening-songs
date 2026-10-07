import { NextResponse } from 'next/server';
import { COOKIE, credsOk, isAdmin, makeToken } from '@/lib/auth';

export const dynamic = 'force-dynamic';
const opts = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' as const, path: '/' };

export const GET = () => NextResponse.json({ admin: isAdmin() });

export async function POST(req: Request) {
  const { id, password } = await req.json().catch(() => ({}));
  if (!credsOk(id ?? '', password ?? '')) {
    await new Promise((r) => setTimeout(r, 800)); // slows down guessing
    return NextResponse.json({ error: 'Wrong ID or password' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, makeToken(), { ...opts, maxAge: 7 * 86400 });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, '', { ...opts, maxAge: 0 });
  return res;
}

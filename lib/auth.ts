import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';
import { ADMIN_ID, ADMIN_PASSWORD } from './config';

export const COOKIE = 'sanctuary_session';
const sign = (v: string) => createHmac('sha256', `${ADMIN_PASSWORD}|sanctuary`).update(v).digest('hex');
const safeEq = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const credsOk = (id: string, pw: string) =>
  safeEq(String(id).trim().toLowerCase(), ADMIN_ID.toLowerCase()) && safeEq(String(pw), ADMIN_PASSWORD);

/** Signed 7-day session token: "<expiry>.<hmac>" */
export const makeToken = () => { const exp = String(Date.now() + 7 * 864e5); return `${exp}.${sign(exp)}`; };

export function isAdmin() {
  const t = cookies().get(COOKIE)?.value;
  if (!t) return false;
  const [exp, sig] = t.split('.');
  return !!exp && !!sig && safeEq(sig, sign(exp)) && Number(exp) > Date.now();
}

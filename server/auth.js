/**
 * Owner auth + waitlist for VerbaDeck — single-owner "internal tool" model.
 *
 * One account only: OWNER_EMAIL (default taskmasterpeace@gmail.com). Everyone else who signs
 * up lands on a waitlist (no access). Sessions are a stateless HMAC-signed cookie token — no
 * DB, no external auth service, built-in `crypto` only.
 *
 * Behind a Cloudflare tunnel this is the app's front door; pair it with Cloudflare Access for
 * defense-in-depth.
 */
import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const COOKIE_NAME = 'vd_session';
const normEmail = (e) => String(e || '').toLowerCase().trim();

// Resolve env-dependent config LAZILY and memoize. ES module imports are hoisted, so reading
// process.env at module top-level would run BEFORE server.js calls dotenv.config(). Every
// consumer below calls cfg() at request time, by which point .env is loaded.
let _cfg = null;
function cfg() {
  if (_cfg) return _cfg;
  const ownerEmail = (process.env.OWNER_EMAIL || 'taskmasterpeace@gmail.com').toLowerCase().trim();
  const secret = process.env.AUTH_SECRET || 'verbadeck-dev-secret-change-me';
  const hash = process.env.OWNER_PASSWORD_HASH
    || (process.env.OWNER_PASSWORD ? hashPassword(process.env.OWNER_PASSWORD) : null);
  const enabled = !!hash && process.env.AUTH_DISABLED !== 'true';
  const waitlistFile = process.env.WAITLIST_FILE || resolve(__dirname, '..', '.data', 'waitlist.json');
  _cfg = { ownerEmail, secret, hash, enabled, waitlistFile };
  return _cfg;
}

export const getOwnerEmail = () => cfg().ownerEmail;
export const isOwnerEmail = (email) => normEmail(email) === cfg().ownerEmail;
const validEmail = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail(e));

// ---------- password hashing (scrypt) ----------
function hashPassword(pw) {
  const salt = randomBytes(16).toString('hex');
  const h = scryptSync(String(pw), salt, 64).toString('hex');
  return `${salt}:${h}`;
}
function verifyPassword(pw, stored) {
  if (!stored || !stored.includes(':')) return false;
  const [salt, h] = stored.split(':');
  const calc = scryptSync(String(pw), salt, 64);
  const orig = Buffer.from(h, 'hex');
  return calc.length === orig.length && timingSafeEqual(calc, orig);
}

// Owner password: prefer a pre-hashed OWNER_PASSWORD_HASH; else hash OWNER_PASSWORD (in cfg()).
export const authConfigured = () => !!cfg().hash;

export function checkOwnerLogin(email, password) {
  const { hash } = cfg();
  if (!isOwnerEmail(email) || !hash) return false;
  return verifyPassword(password, hash);
}

// ---------- stateless session token: base64url(payload).hmac ----------
export function signSession(email, days = 30) {
  const payload = Buffer
    .from(JSON.stringify({ email: normEmail(email), exp: Date.now() + days * 86400000 }))
    .toString('base64url');
  const sig = createHmac('sha256', cfg().secret).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}
export function verifySession(token) {
  if (!token || !token.includes('.')) return null;
  const [payload, sig] = token.split('.');
  const expect = createHmac('sha256', cfg().secret).update(payload).digest('base64url');
  const a = Buffer.from(sig), b = Buffer.from(expect);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString());
    if (!data.exp || data.exp < Date.now()) return null;
    return data;
  } catch { return null; }
}

// ---------- cookie helpers (no cookie-parser dep) ----------
export function readCookie(req, name = COOKIE_NAME) {
  const raw = req.headers.cookie || '';
  const m = raw.match(new RegExp('(?:^|; )' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : null;
}
export function setSessionCookie(res, req, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: !!req.secure, // true behind the tunnel (trust proxy + X-Forwarded-Proto: https)
    maxAge: 30 * 86400000,
    path: '/',
  });
}
export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: '/' });
}

/** Returns the owner email if the request carries a valid owner session, else null. */
export function getOwnerFromReq(req) {
  if (!cfg().enabled) return cfg().ownerEmail; // open mode (unconfigured or AUTH_DISABLED=true)
  const data = verifySession(readCookie(req));
  return data && isOwnerEmail(data.email) ? data.email : null;
}

/** Express middleware — 401 unless the request is the authenticated owner. */
export function requireOwner(req, res, next) {
  if (getOwnerFromReq(req)) return next();
  return res.status(401).json({ error: 'Authentication required' });
}

// ---------- waitlist ----------
async function loadWaitlist() {
  try { return JSON.parse(await readFile(cfg().waitlistFile, 'utf8')); }
  catch { return []; }
}
export async function addToWaitlist({ email, name, note }) {
  if (!validEmail(email)) throw new Error('A valid email is required');
  const list = await loadWaitlist();
  const e = normEmail(email);
  if (!list.some((x) => x.email === e)) {
    list.push({ email: e, name: String(name || '').slice(0, 80), note: String(note || '').slice(0, 280), at: new Date().toISOString() });
    await mkdir(dirname(cfg().waitlistFile), { recursive: true });
    await writeFile(cfg().waitlistFile, JSON.stringify(list, null, 2), 'utf8');
  }
  return { ok: true, count: list.length };
}
export async function getWaitlist() {
  return loadWaitlist();
}

# Run VerbaDeck behind a Cloudflare named tunnel (internal tool)

This serves VerbaDeck from **your machine**, reachable at a public HTTPS hostname (e.g.
`app.verbadeck.com`), gated to a **single owner account** (you) with a **waitlist** for everyone
else. Pair it with **Cloudflare Access** for a second lock.

> The app already enforces auth: every `/api/*` route and the voice WebSocket require the owner
> session, and unauthenticated visitors get the public landing page + waitlist. The tunnel just
> exposes it; Access (optional) adds a network-level gate.

## 0. One-time: how auth is configured
In the project `.env` (already set up for you):
```
OWNER_EMAIL=taskmasterpeace@gmail.com
OWNER_PASSWORD=<your password>      # change this to something you'll remember
AUTH_SECRET=<random secret>         # rotating it logs everyone out
```
Only `OWNER_EMAIL` can sign in. Everyone else who signs up lands on the waitlist
(`.data/waitlist.json`; the owner can read it at `GET /api/waitlist`).

## 1. Build + run the single-origin server
The whole app (client + API + WS) runs on one origin, port 3002 — required for the tunnel.
```bash
npm run build:client                       # → client/dist
cd server && NODE_ENV=production node server.js
# logs: "📦 Serving built client from client/dist (single-origin mode)"
```
Open http://localhost:3002 — you should see the landing/sign-in gate.

## 2. Install cloudflared + authenticate (your Cloudflare account)
```bash
# install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/
cloudflared tunnel login                   # opens a browser → pick your Cloudflare zone
```
> Your domain must be on Cloudflare. To use `verbadeck.com`, move its nameservers from GoDaddy to
> Cloudflare (Cloudflare → Add site → it gives you two nameservers → set them at GoDaddy).
> Just testing? Skip the domain and run `cloudflared tunnel --url http://localhost:3002` for a
> throwaway `*.trycloudflare.com` link.

## 3. Create the tunnel + route DNS
```bash
cloudflared tunnel create verbadeck        # prints a TUNNEL_UUID + a credentials .json path
cloudflared tunnel route dns verbadeck app.verbadeck.com
```
Copy `cloudflared.config.example.yml` → `~/.cloudflared/config.yml` and fill in the UUID +
credentials-file path.

## 4. Run it
```bash
cloudflared tunnel run verbadeck
```
Visit **https://app.verbadeck.com** → the gate → sign in with your owner email + password.
Voice, AI, and the Knowledge Brain all work because it's one secure origin (`wss://…/ws`).

To keep it always-on, install cloudflared as a service (`cloudflared service install`) and run
the Node server under a process manager (pm2 / a Windows service / Task Scheduler).

## 5. (Recommended) Add Cloudflare Access — a second lock
Cloudflare dashboard → **Zero Trust → Access → Applications → Add** → self-hosted →
`app.verbadeck.com` → policy **Allow** where **email == taskmasterpeace@gmail.com**. Now the page
is gated at the network edge *and* by the app — nobody else can even load it. Free up to 50 users.

## Notes & limits
- **Your machine must stay on** — the tunnel only exposes this computer. For 24/7, use a real host
  (Railway/Render) instead.
- The voice/phone-remote WebSockets are owner-gated, so the phone remote works when that device is
  also signed in as the owner.
- `app.set('trust proxy', true)` is on, so session cookies are `Secure` behind the tunnel.

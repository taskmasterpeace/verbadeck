# Deploying VerbaDeck

## Landing page → GitHub Pages at verbadeck.com

The landing page (`docs/landing/`) deploys automatically via GitHub Actions
(`.github/workflows/deploy-pages.yml`) on every push to `main`. A `CNAME` file pins the
custom domain.

### One-time setup

**1. Enable Pages (GitHub):**
Repo → **Settings → Pages → Build and deployment → Source = "GitHub Actions"**.
The next push to `main` runs the workflow and publishes the site.

**2. Point the domain (GoDaddy):**
In GoDaddy → **My Products → verbadeck.com → DNS**, set:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | `@` | `185.199.108.153` | 600 |
| A | `@` | `185.199.109.153` | 600 |
| A | `@` | `185.199.110.153` | 600 |
| A | `@` | `185.199.111.153` | 600 |
| CNAME | `www` | `taskmasterpeace.github.io` | 600 |

(Optional IPv6 — add as AAAA records on `@`: `2606:50c0:8000::153`, `2606:50c0:8001::153`,
`2606:50c0:8002::153`, `2606:50c0:8003::153`.)

Delete any existing GoDaddy "Parked"/forwarding A or CNAME records on `@` and `www` first,
or they'll conflict.

**3. Set the custom domain (GitHub):**
Repo → **Settings → Pages → Custom domain → `verbadeck.com` → Save**, then tick
**Enforce HTTPS** once the certificate is issued (can take 15 min–24 h after DNS propagates).

### Verify
- DNS: `nslookup verbadeck.com` should return the four `185.199.x.153` IPs.
- Site: https://verbadeck.com serves the landing page; `www` redirects to apex.

---

## The full app (voice + AI) → a Node host

GitHub Pages is static only. The app needs the Express server (AssemblyAI WebSocket proxy +
OpenRouter/Replicate calls that keep API keys server-side), so it can't run on Pages.

Recommended split:
- **Client** (`client/`, `npm run build:client` → `client/dist/`) → Vercel / Netlify, or served by the server.
- **Server** (`server/`) → Railway / Render / Fly, with `AAI_API_KEY`, `OPENROUTER_API_KEY`,
  `PEXELS_API_KEY` set as environment variables, and `ALLOWED_ORIGINS=https://verbadeck.com`.
- Point the client's API/WS base at the deployed server URL (use `wss://` in production).

Put the app on a subdomain (e.g. `app.verbadeck.com`) and keep `verbadeck.com` for the landing page.

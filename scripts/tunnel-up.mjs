#!/usr/bin/env node
/**
 * One-command finisher for the VerbaDeck named Cloudflare tunnel.
 *
 * PREREQUISITES (your account — do these once, see docs/DEPLOY-TUNNEL.md):
 *   1. verbadeck.com is on Cloudflare (nameservers changed at GoDaddy → Cloudflare).
 *   2. `cloudflared tunnel login` has been run (creates ~/.cloudflared/cert.pem).
 *   3. The single-origin server is running on :3002  (cd server && node server.js,
 *      after `npm run build:client`).
 *
 * Then:  node scripts/tunnel-up.mjs            # → app.verbadeck.com
 *        node scripts/tunnel-up.mjs verbadeck demo.verbadeck.com   # custom name/host
 */
import { execSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';

const NAME = process.argv[2] || 'verbadeck';
const HOST = process.argv[3] || 'app.verbadeck.com';
const CF = join(homedir(), '.cloudflared');
const sh = (cmd) => execSync(cmd, { stdio: ['inherit', 'pipe', 'inherit'] }).toString().trim();
const run = (cmd) => execSync(cmd, { stdio: 'inherit' });

function die(msg) { console.error(`\n❌ ${msg}\n`); process.exit(1); }

// 0. preflight
if (!existsSync(join(CF, 'cert.pem'))) {
  die('Not logged in. Run:  cloudflared tunnel login   (needs verbadeck.com on Cloudflare first)');
}
try { execSync('cloudflared --version', { stdio: 'ignore' }); } catch { die('cloudflared is not installed.'); }

// 1. create the tunnel if it doesn't exist
let list = '';
try { list = sh('cloudflared tunnel list'); } catch { /* none yet */ }
if (!new RegExp(`\\s${NAME}\\s`).test(list)) {
  console.log(`📡 Creating tunnel "${NAME}"…`);
  run(`cloudflared tunnel create ${NAME}`);
  list = sh('cloudflared tunnel list');
}
const uuid = (list.split('\n').find((l) => new RegExp(`\\s${NAME}\\s`).test(l)) || '').trim().split(/\s+/)[0];
if (!uuid) die(`Could not resolve the UUID for tunnel "${NAME}".`);
console.log(`✓ Tunnel ${NAME} = ${uuid}`);

// 2. route DNS (requires the zone on Cloudflare)
console.log(`🌐 Routing ${HOST} → ${NAME}…`);
try { run(`cloudflared tunnel route dns ${NAME} ${HOST}`); }
catch { console.warn(`⚠️  DNS route failed — is verbadeck.com on Cloudflare yet? Continuing.`); }

// 3. write the config
mkdirSync(CF, { recursive: true });
const config = `tunnel: ${uuid}
credentials-file: ${join(CF, uuid + '.json')}

ingress:
  - hostname: ${HOST}
    service: http://localhost:3002
  - service: http_status:404
`;
writeFileSync(join(CF, 'config.yml'), config, 'utf8');
console.log(`✓ Wrote ${join(CF, 'config.yml')}`);

// 4. run
console.log(`\n🚀 Starting tunnel — your app will be live at https://${HOST}\n`);
run(`cloudflared tunnel run ${NAME}`);

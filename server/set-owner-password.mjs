#!/usr/bin/env node
/**
 * Reset the single owner's password (recovery path — UJ-009).
 * Usage:  node server/set-owner-password.mjs "my new password"
 *     or  npm run reset-owner-password -- "my new password"
 * Then restart the server.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env');
const pw = process.argv[2];

if (!pw || pw.length < 6) {
  console.error('Usage: node server/set-owner-password.mjs "<new password, 6+ chars>"');
  process.exit(1);
}

let env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
if (/^OWNER_PASSWORD=.*$/m.test(env)) {
  env = env.replace(/^OWNER_PASSWORD=.*$/m, `OWNER_PASSWORD=${pw}`);
} else {
  env = env.replace(/\s*$/, '') + `\nOWNER_PASSWORD=${pw}\n`;
}
writeFileSync(envPath, env);
console.log('✅ Owner password updated in .env — restart the server to apply.');

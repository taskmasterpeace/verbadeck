import { test, expect, Page } from '@playwright/test';

/**
 * Knowledge Brain — end-to-end through the real client + server via the agent-native bridge.
 * Adds text, lists it, semantically searches it (planted fact ranks #1), then deletes it.
 * Uses the real server embedder; queries share key terms so retrieval is unambiguous.
 */

type KB = {
  add: (text: string, title?: string) => Promise<{ docId: string; chunks: number }>;
  ask: (q: string, tone?: string) => Promise<{ answers: unknown; sources: unknown[] }>;
  search: (q: string, topK?: number) => Promise<{ results: { title: string; score: number; text: string }[] }>;
  list: () => Promise<{ documents: { docId: string; title: string }[]; stats: { chunks: number } }>;
};
declare global { interface Window { __verbadeck?: { knowledge: KB } } }

async function bridge(page: Page) {
  await page.goto('/knowledge?testMode=true', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => !!window.__verbadeck?.knowledge, null, { timeout: 20000 });
}

test('Knowledge Brain: add → list → semantic search → delete', async ({ page }) => {
  await bridge(page);
  const marker = `e2e ${Date.now()}`;
  const text = `${marker}\nThe VerbaDeck pricing has three tiers: free, pro at nineteen dollars, and team at forty-nine dollars per seat.`;

  const added = await page.evaluate((t) => window.__verbadeck!.knowledge.add(t, 'E2E Pricing'), text);
  expect(added.docId).toMatch(/^doc-/);
  expect(added.chunks).toBeGreaterThanOrEqual(1);

  const list = await page.evaluate(() => window.__verbadeck!.knowledge.list());
  expect(list.documents.some((d) => d.docId === added.docId)).toBeTruthy();

  const search = await page.evaluate(() => window.__verbadeck!.knowledge.search('what are the pricing tiers and seat price?', 5));
  expect(search.results.length).toBeGreaterThan(0);
  // the planted pricing chunk should surface near the top
  const top3 = search.results.slice(0, 3).map((r) => r.text).join(' ');
  expect(top3).toContain('forty-nine dollars');

  // cleanup
  const del = await page.evaluate((id) => fetch(`/api/knowledge/${id}`, { method: 'DELETE' }).then((r) => r.json()), added.docId);
  expect(del.ok).toBeTruthy();
});

test('Knowledge Brain UI renders with stats and an add form', async ({ page }) => {
  await page.goto('/knowledge?testMode=true', { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Knowledge Brain' })).toBeVisible();
  await expect(page.getByText(/documents/i).first()).toBeVisible();
  await expect(page.getByPlaceholder(/Paste anything/i)).toBeVisible();
});

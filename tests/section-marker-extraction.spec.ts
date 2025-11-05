import { test, expect } from '@playwright/test';

test('Extract titles from SECTION marker format', async ({ page }) => {
  await page.goto('http://localhost:5178');

  // Wait for app to load
  await page.waitForSelector('text=Create Your Presentation', { timeout: 10000 });

  // Click "Process Content" card (button inside says "Process Content")
  await page.click('button:has-text("Process Content")');

  // Wait for textarea
  await page.waitForSelector('textarea[placeholder*="Paste"]', { timeout: 5000 });

  // User's exact test presentation with SECTION markers
  const userTestPresentation = `SECTION 1: OPENING HOOK (15 seconds)
AI can write your emails. Generate presentations overnight. The cost of creativity has collapsed.
But when you're IN a meeting RIGHT NOW, needing guidance THIS SECOND?
Every tool says 'I'll help you later.'
We're the first bringing AI INTO live conversations. While you're still in the room.

SECTION 2: THE PROBLEM (20 seconds)
Think about your last big meeting. Client on Zoom. Stakes are high.
They ask a tough question: "How do our numbers compare to last quarter?"
You KNOW the report exists... somewhere.
What do you do? Scramble through folders? Guess? Say 'I'll get back to you'?
78% of professionals say they need information DURING meetings but can't access it.

SECTION 3: THE COST (20 seconds)
That 'I'll get back to you' moment? It just cost you:
- Client confidence (they now doubt your readiness)
- Deal velocity (negotiations drag out)
- Team efficiency (follow-up emails, extra calls)
Surveys show 62% of sales professionals lose deals because they couldn't answer questions in real-time.

SECTION 4: THE EXISTING LANDSCAPE (15 seconds)
You might think: "Can't Slack/ChatGPT/Perplexity do this?"
Yes, but they're ASYNCHRONOUS. You type → wait → read → relay.
That 30-second delay breaks conversation flow.
Clients notice. Momentum dies.
We're the only SYNCHRONOUS solution—listening, analyzing, and whispering answers WHILE the other person is still talking.

SECTION 5: WHAT WE DO (20 seconds)
Our AI joins your meeting, listens silently in the background.
Someone asks: "What's our runway looking like?"
Before the question even ends, you see a subtle popup:
"18 months runway based on current burn rate (source: finance report, updated yesterday)."
You answer confidently, immediately. Client thinks you're superhuman.

SECTION 6: WHY IT MATTERS (15 seconds)
Speed isn't a luxury—it's THE deciding factor.
Meetings are where deals close, decisions happen, reputations are built.
You can't say "Let me Slack my team and circle back."
You need answers NOW. That's what we deliver.

SECTION 7: USE CASES (20 seconds)
- Sales reps: Close deals faster with instant answers to objections and technical questions
- Managers: Make faster decisions with real-time data and context from your company's knowledge base
- Consultants: Impress clients by instantly recalling past work, metrics, and recommendations without fumbling

SECTION 8: THE CLOSE (20 seconds)
This isn't about replacing you—it's about making you unstoppable.
Imagine never saying 'I'll get back to you' again.
Imagine every meeting feeling like you have a genius analyst whispering in your ear.
That's what we built. And we're ready to bring it into YOUR meetings today.`.trim();

  // Paste the test content
  await page.fill('textarea[placeholder*="Paste"]', userTestPresentation);

  // Click "Process with AI"
  await page.click('button:has-text("Process with AI")');

  // Wait for processing to complete
  await page.waitForSelector('button:has-text("Go to Editor")', { timeout: 60000 });

  console.log('\n========== SECTION MARKER EXTRACTION TEST ==========\n');

  // Click "Go to Editor"
  await page.click('button:has-text("Go to Editor")');

  // Wait for editor to load
  await page.waitForSelector('text=Section', { timeout: 5000 });

  // Extract all sections and their headings
  const sections = await page.$$eval('[class*="border"]', (elements) => {
    return elements.map((el, i) => {
      // Look for the heading - it should be in a larger/bold text element
      const headingEl = el.querySelector('h3, [class*="font-bold"], [class*="text-lg"]');
      const content = el.textContent || '';

      return {
        index: i + 1,
        heading: headingEl?.textContent?.trim() || 'NO HEADING FOUND',
        content: content.substring(0, 200)
      };
    });
  });

  console.log(`Found ${sections.length} sections\n`);

  // Expected titles (what we want to extract)
  const expectedTitles = [
    'Opening Hook',
    'The Problem',
    'The Cost',
    'The Existing Landscape',
    'What We Do',
    'Why It Matters',
    'Use Cases',
    'The Close'
  ];

  // Check each section
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const expected = expectedTitles[i];

    console.log(`\n--- Section ${section.index} ---`);
    console.log(`Heading: "${section.heading}"`);
    console.log(`Expected: "${expected}"`);

    // Check for bad patterns
    const hasSectionPrefix = section.heading.toLowerCase().includes('section ');
    const hasTiming = /\(\d+\s+seconds?\)/.test(section.heading);

    if (hasSectionPrefix) {
      console.log('❌ ERROR: Heading contains "SECTION X:" prefix');
    }
    if (hasTiming) {
      console.log('❌ ERROR: Heading contains timing marker like "(15 seconds)"');
    }

    // Check if it matches expected (case-insensitive)
    const matches = section.heading.toLowerCase() === expected.toLowerCase();
    if (matches) {
      console.log('✅ PASS: Title extracted correctly');
    } else {
      console.log(`⚠️  Title mismatch - got "${section.heading}" but expected "${expected}"`);
    }

    console.log('---\n');
  }

  console.log('\n========== TEST COMPLETE ==========\n');

  // Take screenshot
  await page.screenshot({ path: 'tests/screenshots/section-marker-extraction.png', fullPage: true });

  // Also check presenter view
  await page.click('button:has-text("Present")');
  await page.waitForTimeout(2000);

  const slideHeading = await page.locator('h2').first().textContent();
  console.log(`\nPresenter View - First Slide Heading: "${slideHeading}"`);

  const hasPresenterSectionPrefix = slideHeading?.toLowerCase().includes('section ');
  const hasPresenterTiming = slideHeading ? /\(\d+\s+seconds?\)/.test(slideHeading) : false;

  if (hasPresenterSectionPrefix) {
    console.log('❌ ERROR: Presenter view heading contains "SECTION X:"');
  }
  if (hasPresenterTiming) {
    console.log('❌ ERROR: Presenter view heading contains timing marker');
  }
  if (!hasPresenterSectionPrefix && !hasPresenterTiming) {
    console.log('✅ PASS: Presenter view heading is clean');
  }

  await page.screenshot({ path: 'tests/screenshots/section-marker-presenter.png', fullPage: true });
});

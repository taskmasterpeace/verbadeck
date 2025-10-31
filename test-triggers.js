const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 1000
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Capture all console messages
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    console.log(`BROWSER:`, text);
    logs.push(text);
  });

  console.log('Opening http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Paste test script
  const testScript = `This is about our amazing product. It will revolutionize the market.

We have identified a critical problem. Many businesses struggle with efficiency.

Our solution is innovative and practical. It saves time and money.`;

  console.log('\n=== STEP 1: Pasting test script ===');
  await page.fill('textarea', testScript);
  await page.waitForTimeout(500);

  console.log('\n=== STEP 2: Processing with AI ===');
  await page.click('button:has-text("Process with AI")');

  // Wait for processing to complete (look for Edit Sections button to be enabled)
  console.log('Waiting for AI processing to complete...');
  await page.waitForSelector('button:has-text("Edit Sections"):not([disabled])', { timeout: 120000 });
  console.log('Processing complete!');

  await page.waitForTimeout(2000);

  // Click Edit Sections to view what was created
  console.log('\n=== STEP 3: Viewing sections ===');
  await page.click('button:has-text("Edit Sections")');
  await page.waitForTimeout(2000);

  // Find all section cards and inspect their triggers
  console.log('\n=== STEP 4: Inspecting section triggers ===');

  // Look for trigger information in the debug output
  const debugInfo = await page.textContent('body');
  console.log('\nPage contains debug info:');

  // Extract section information from page
  const sectionCards = await page.$$('.space-y-4 > div');
  console.log(`\nFound ${sectionCards.length} section cards`);

  // Take screenshot
  await page.screenshot({ path: 'test-sections.png', fullPage: true });
  console.log('\nScreenshot saved to test-sections.png');

  // Now go to presenter mode and test triggers
  console.log('\n=== STEP 5: Entering presenter mode ===');
  await page.click('button:has-text("Present")');
  await page.waitForTimeout(2000);

  // Look at debug output at bottom of page
  const debugText = await page.textContent('.bg-muted.rounded-lg.text-xs');
  console.log('\n=== DEBUG OUTPUT ===');
  console.log(debugText);

  // Capture logs that show section triggers
  console.log('\n=== ANALYZING LOGS FOR TRIGGER INFO ===');
  const triggerLogs = logs.filter(log =>
    log.includes('Section') ||
    log.includes('trigger') ||
    log.includes('Auto-fixed') ||
    log.includes('selectedTriggers')
  );

  console.log('\nRelevant logs:');
  triggerLogs.forEach(log => console.log('  ' + log));

  console.log('\n\n=== TEST COMPLETE ===');
  console.log('Check the logs above to see:');
  console.log('1. What triggers were assigned to each section');
  console.log('2. Whether auto-fix was applied');
  console.log('3. Current section trigger words');

  // Keep browser open
  console.log('\nBrowser staying open for manual inspection...');
  await page.waitForTimeout(300000);

  await browser.close();
})();

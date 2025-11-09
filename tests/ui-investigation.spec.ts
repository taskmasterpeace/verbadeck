import { test, expect } from '@playwright/test';

test('UI Investigation - Capture actual current state', async ({ page }) => {
  console.log('🔍 UI Investigation Starting...\n');

  // Navigate to app
  await page.goto('http://localhost:5173');
  await page.waitForLoadState('networkidle');
  console.log('✅ App loaded');

  // Take screenshot of home page
  await page.screenshot({
    path: 'tests/screenshots/ui-investigation-home.png',
    fullPage: true
  });
  console.log('📸 Home page screenshot saved');

  // Log all visible text on home page
  const bodyText = await page.locator('body').textContent();
  console.log('\n📝 HOME PAGE TEXT:');
  console.log('='.repeat(80));
  console.log(bodyText?.substring(0, 1000));
  console.log('='.repeat(80));

  // Find all buttons
  const buttons = await page.locator('button').all();
  console.log(`\n🔘 Found ${buttons.length} buttons:`);
  for (let i = 0; i < Math.min(buttons.length, 20); i++) {
    const buttonText = await buttons[i].textContent();
    const isVisible = await buttons[i].isVisible();
    console.log(`  ${i + 1}. "${buttonText?.trim()}" ${isVisible ? '✓' : '(hidden)'}`);
  }

  // Check for elements the failing tests expect
  console.log('\n🔎 CHECKING FOR ELEMENTS THAT TESTS EXPECT:\n');

  // verbadeck.spec.ts line 22 expects: "⏸️ PAUSED"
  const pausedStatus = page.locator('text=⏸️ PAUSED');
  const hasPaused = await pausedStatus.count() > 0;
  console.log(`  ⏸️ PAUSED status: ${hasPaused ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // verbadeck.spec.ts line 31 expects: "Next Up"
  const nextUp = page.locator('text=Next Up');
  const hasNextUp = await nextUp.count() > 0;
  console.log(`  "Next Up" text: ${hasNextUp ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // verbadeck.spec.ts line 35 expects: "Section X of Y"
  const sectionCount = page.locator('text=/Section \\d+ of \\d+/');
  const hasSectionCount = await sectionCount.count() > 0;
  console.log(`  "Section X of Y": ${hasSectionCount ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // verbadeck.spec.ts line 39 expects: "Live Transcript"
  const liveTranscript = page.locator('text=Live Transcript');
  const hasLiveTranscript = await liveTranscript.count() > 0;
  console.log(`  "Live Transcript": ${hasLiveTranscript ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // verbadeck.spec.ts line 49 expects: "Start Listening" button
  const startListening = page.locator('button:has-text("Start Listening")');
  const hasStartListening = await startListening.count() > 0;
  console.log(`  "Start Listening" button: ${hasStartListening ? '✅ FOUND' : '❌ NOT FOUND'}`);

  // Check what status indicators DO exist
  console.log('\n🔍 STATUS INDICATORS THAT DO EXIST:');
  const statusElements = await page.locator('[class*="status"], [class*="Status"]').all();
  console.log(`  Found ${statusElements.length} elements with "status" in class name`);
  for (const el of statusElements.slice(0, 5)) {
    const text = await el.textContent();
    console.log(`    - "${text?.trim().substring(0, 50)}"`);
  }

  // Try clicking through to a presenter view if that mode exists
  console.log('\n🔍 Looking for mode switches or navigation...');
  const presenterButton = page.locator('button:has-text("Presenter"), button:has-text("Present")').first();
  const hasPresenterButton = await presenterButton.count() > 0;

  if (hasPresenterButton) {
    console.log('  ✅ Found presenter/present button, clicking...');
    await presenterButton.click();
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/ui-investigation-presenter.png',
      fullPage: true
    });
    console.log('  📸 Presenter view screenshot saved');

    const presenterText = await page.locator('body').textContent();
    console.log('\n📝 PRESENTER VIEW TEXT:');
    console.log('='.repeat(80));
    console.log(presenterText?.substring(0, 1000));
    console.log('='.repeat(80));

    // Recheck for expected elements in presenter view
    console.log('\n🔎 RECHECKING IN PRESENTER VIEW:\n');

    const pausedStatus2 = await page.locator('text=⏸️ PAUSED').count() > 0;
    console.log(`  ⏸️ PAUSED: ${pausedStatus2 ? '✅ FOUND' : '❌ NOT FOUND'}`);

    const nextUp2 = await page.locator('text=Next Up').count() > 0;
    console.log(`  "Next Up": ${nextUp2 ? '✅ FOUND' : '❌ NOT FOUND'}`);

    const sectionCount2 = await page.locator('text=/Section \\d+ of \\d+/').count() > 0;
    console.log(`  "Section X of Y": ${sectionCount2 ? '✅ FOUND' : '❌ NOT FOUND'}`);

    const startListening2 = await page.locator('button:has-text("Start Listening")').count() > 0;
    console.log(`  "Start Listening": ${startListening2 ? '✅ FOUND' : '❌ NOT FOUND'}`);
  } else {
    console.log('  ❌ No presenter/present button found');
  }

  console.log('\n✅ UI Investigation Complete');
  console.log('\n📊 SUMMARY:');
  console.log('  Screenshots saved to tests/screenshots/');
  console.log('  - ui-investigation-home.png');
  if (hasPresenterButton) {
    console.log('  - ui-investigation-presenter.png');
  }
});

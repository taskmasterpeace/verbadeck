const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({
    headless: false,
    slowMo: 800
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('Opening http://localhost:5174...');
  await page.goto('http://localhost:5174', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  // Process a test script with image
  const testScript = `This is our amazing product. It will revolutionize everything.

We have identified a critical problem in the market today.

Our solution is innovative and game-changing.`;

  console.log('\n=== Creating sections ===');
  await page.fill('textarea', testScript);
  await page.click('button:has-text("Process with AI")');
  await page.waitForSelector('button:has-text("Edit Sections"):not([disabled])', { timeout: 120000 });

  console.log('✅ Sections created');
  await page.waitForTimeout(1000);

  // Add an image URL to first section
  console.log('\n=== Adding image URL to first section ===');
  await page.click('button:has-text("Edit Sections")');
  await page.waitForTimeout(1000);

  // Click Edit on first section
  const editButtons = await page.$$('button:has-text("Edit")');
  if (editButtons.length > 0) {
    await editButtons[0].click();
    await page.waitForTimeout(500);

    // Add image URL
    await page.fill('input[type="url"]', 'https://picsum.photos/800/600');
    await page.click('button:has-text("Save")');
    console.log('✅ Image added to first section');
  }

  await page.waitForTimeout(1000);

  // Go to presenter mode
  console.log('\n=== Going to presenter mode ===');
  await page.click('button:has-text("Present")');
  await page.waitForTimeout(2000);

  // Take screenshot of presenter view
  await page.screenshot({ path: 'presenter-view.png', fullPage: true });
  console.log('📸 Screenshot: presenter-view.png');

  // Check if image is visible
  const img = await page.$('img[alt*="Slide"]');
  if (img) {
    console.log('✅ Image found in presenter view');
    const bbox = await img.boundingBox();
    console.log('   Image dimensions:', bbox);
  } else {
    console.log('❌ No image found in presenter view');
  }

  // Try to open audience view (won't actually open in headless, but we can check the handler)
  console.log('\n=== Checking audience view button ===');
  const audienceButton = await page.$('button:has-text("Audience View")');
  if (audienceButton) {
    console.log('✅ Audience view button found');
  } else {
    console.log('❌ Audience view button not found');
  }

  // Start streaming to see carousel and transcript
  console.log('\n=== Starting streaming to check layout ===');
  await page.click('button:has-text("Start Listening")');
  await page.waitForTimeout(3000);

  // Take screenshot with streaming active
  await page.screenshot({ path: 'streaming-layout.png', fullPage: true });
  console.log('📸 Screenshot: streaming-layout.png');

  // Check carousel position
  const carousel = await page.$('.fixed.bottom-8');
  if (carousel) {
    const bbox = await carousel.boundingBox();
    console.log('✅ Carousel found');
    console.log('   Position from bottom:', bbox ? `${bbox.y}px` : 'unknown');
  }

  // Check transcript ticker position
  const transcript = await page.$('.fixed.bottom-32');
  if (transcript) {
    const bbox = await transcript.boundingBox();
    console.log('✅ Transcript ticker found');
    console.log('   Position from bottom:', bbox ? `${bbox.y}px` : 'unknown');
  }

  // Get viewport height
  const viewportHeight = await page.evaluate(() => window.innerHeight);
  console.log('\n📏 Viewport height:', viewportHeight);

  console.log('\n=== ISSUES TO FIX ===');
  console.log('1. Check if transcript bar is truly at bottom');
  console.log('2. Verify carousel spacing');
  console.log('3. Need to test AudienceView separately (requires actual popup)');

  console.log('\nKeeping browser open for 30 seconds...');
  await page.waitForTimeout(30000);

  await browser.close();
})();

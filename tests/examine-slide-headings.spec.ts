import { test, expect } from '@playwright/test';

test('Examine slide headings from generated content', async ({ page }) => {
  await page.goto('http://localhost:5175');

  // Wait for app to load
  await page.waitForSelector('text=Create Your Presentation', { timeout: 10000 });

  // Click "Create from Scratch"
  await page.click('button:has-text("Create from Scratch")');

  // Wait for question input
  await page.waitForSelector('textarea[placeholder*="topic"]', { timeout: 5000 });

  // Enter a topic
  await page.fill('textarea[placeholder*="topic"]', 'The Future of Artificial Intelligence');

  // Click "Generate Questions"
  await page.click('button:has-text("Generate Questions")');

  // Wait for questions to be generated
  await page.waitForSelector('button:has-text("Generate Slides")', { timeout: 30000 });

  // Click "Generate Slides"
  await page.click('button:has-text("Generate Slides")');

  // Wait for slides to be generated
  await page.waitForSelector('text=Go to Editor', { timeout: 60000 });

  // Click "Go to Editor"
  await page.click('button:has-text("Go to Editor")');

  // Wait for editor to load
  await page.waitForSelector('text=Section', { timeout: 5000 });

  // Take a screenshot of the editor
  await page.screenshot({ path: 'tests/screenshots/editor-view.png', fullPage: true });

  // Extract all section headings
  const sections = await page.$$('[class*="border"]');

  console.log('\n========== SLIDE HEADINGS ANALYSIS ==========\n');

  for (let i = 0; i < sections.length; i++) {
    const sectionText = await sections[i].textContent();
    console.log(`\n--- Section ${i + 1} ---`);
    console.log(sectionText?.substring(0, 200)); // First 200 chars
    console.log('---\n');
  }

  // Now switch to presenter view to see the actual slide display
  await page.click('button:has-text("Present")');

  // Wait for presenter view
  await page.waitForSelector('[class*="presenter"]', { timeout: 5000 });

  // Take screenshot of first slide
  await page.screenshot({ path: 'tests/screenshots/slide-1.png', fullPage: true });

  // Get the main slide content
  const slideContent = await page.locator('[class*="slide"]').first().textContent();
  console.log('\n========== FIRST SLIDE CONTENT ==========\n');
  console.log(slideContent);
  console.log('\n========================================\n');

  // Navigate through a few slides to see headings
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press('ArrowRight'); // Next slide
    await page.waitForTimeout(1000);

    const currentSlideContent = await page.locator('[class*="slide"]').first().textContent();
    console.log(`\n========== SLIDE ${i + 2} CONTENT ==========\n`);
    console.log(currentSlideContent);
    console.log('\n========================================\n');

    await page.screenshot({ path: `tests/screenshots/slide-${i + 2}.png`, fullPage: true });
  }

  // Also test "Process Existing Content" workflow
  await page.goto('http://localhost:5175');
  await page.waitForSelector('text=Create Your Presentation', { timeout: 10000 });

  await page.click('button:has-text("Process Existing Content")');

  await page.waitForSelector('textarea[placeholder*="Paste"]', { timeout: 5000 });

  const sampleContent = `
The Rise of Artificial Intelligence

Artificial intelligence is transforming how we live and work. From healthcare to transportation, AI systems are becoming increasingly sophisticated and capable.

Machine Learning Fundamentals

At the core of modern AI lies machine learning, a technique that allows computers to learn from data without explicit programming. Neural networks have proven particularly effective.

Deep Learning Revolution

Deep learning, using multi-layered neural networks, has achieved breakthrough results in image recognition, natural language processing, and game playing. The technology continues to advance rapidly.

Ethical Considerations

As AI becomes more powerful, we must address important ethical questions about bias, privacy, and the impact on employment. Responsible development is crucial.

The Future Ahead

Looking forward, AI will likely continue to transform society in profound ways. Collaboration between humans and AI systems will become increasingly important.
  `.trim();

  await page.fill('textarea[placeholder*="Paste"]', sampleContent);

  // Click Process
  await page.click('button:has-text("Process Script")');

  // Wait for processing
  await page.waitForSelector('button:has-text("Go to Editor")', { timeout: 60000 });

  await page.click('button:has-text("Go to Editor")');

  await page.waitForSelector('text=Section', { timeout: 5000 });

  // Extract processed content headings
  console.log('\n\n========== PROCESSED CONTENT ANALYSIS ==========\n');

  const processedSections = await page.$$('[class*="border"]');

  for (let i = 0; i < processedSections.length; i++) {
    const sectionText = await processedSections[i].textContent();
    console.log(`\n--- Processed Section ${i + 1} ---`);
    console.log(sectionText?.substring(0, 200));
    console.log('---\n');
  }

  await page.screenshot({ path: 'tests/screenshots/processed-editor-view.png', fullPage: true });

  // Present processed content
  await page.click('button:has-text("Present")');

  await page.waitForTimeout(2000);

  await page.screenshot({ path: 'tests/screenshots/processed-slide-1.png', fullPage: true });

  const processedSlideContent = await page.locator('[class*="slide"]').first().textContent();
  console.log('\n========== PROCESSED FIRST SLIDE ==========\n');
  console.log(processedSlideContent);
  console.log('\n==========================================\n');
});

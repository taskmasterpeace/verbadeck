import { test, expect } from '@playwright/test';

test('Check presenter view layout', async ({ page }) => {
  // Navigate to app
  await page.goto('http://localhost:5174');

  // Wait for app to load
  await page.waitForTimeout(1000);

  // Click "Process Existing Content" card to get to the text input
  const processCard = page.getByText('Process Existing Content');
  await processCard.click();
  await page.waitForTimeout(500);

  // Create a simple presentation
  const scriptText = `
# Introduction
Welcome to our presentation about AI

# Main Topic
This is the main content of our talk

# Conclusion
Thank you for attending
  `.trim();

  // Find and fill the textarea
  const textarea = page.locator('textarea').first();
  await textarea.fill(scriptText);

  // Click "Process with AI" button
  const processButton = page.getByRole('button', { name: /process/i });
  if (await processButton.isVisible()) {
    await processButton.click();
    await page.waitForTimeout(8000); // Wait for AI processing to complete
  }

  // Switch to presenter view - use the specific "3. Present" button
  const presenterButton = page.getByRole('button', { name: '3. Present' });
  await presenterButton.click();
  await page.waitForTimeout(1000);

  // Take screenshot
  await page.screenshot({ path: '.playwright-mcp/presenter-view-current.png', fullPage: true });

  console.log('Screenshot saved to .playwright-mcp/presenter-view-current.png');
});

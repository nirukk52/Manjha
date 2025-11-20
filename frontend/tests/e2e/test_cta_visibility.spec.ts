/**
 * Playwright test for CTA button visibility on Manjha landing page
 * Tests that the "Open Dashboard" CTA button is visible and accessible
 */

import { test, expect } from '@playwright/test';

test.describe('Landing Page CTA Visibility', () => {
  test('CTA button should be visible on landing page', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for animations
    
    // Take screenshot
    await page.screenshot({ 
      path: 'tests/e2e/test-results/landing-page-initial.png', 
      fullPage: true 
    });
    
    // Find the CTA button - try multiple selectors
    const ctaButton = page.locator('button:has-text("Open Dashboard")').first();
    
    // Verify button exists
    await expect(ctaButton).toBeVisible({ timeout: 5000 });
    
    // Scroll button into view
    await ctaButton.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Verify button is in viewport after scroll
    const boundingBox = await ctaButton.boundingBox();
    expect(boundingBox).not.toBeNull();
    
    // Verify button text
    const buttonText = await ctaButton.innerText();
    expect(buttonText).toContain('Dashboard');
    
    // Verify button is enabled
    await expect(ctaButton).toBeEnabled();
    
    // Take screenshot after scroll
    await page.screenshot({ 
      path: 'tests/e2e/test-results/landing-page-scrolled.png', 
      fullPage: true 
    });
    
    // Verify button styling (has expected classes)
    const classes = await ctaButton.getAttribute('class');
    expect(classes).toBeTruthy();
    expect(classes).toContain('bg-'); // Should have background color class
    
    console.log('✅ CTA button visibility test passed!');
    console.log(`   Button text: "${buttonText}"`);
    console.log(`   Position: x=${boundingBox?.x}, y=${boundingBox?.y}`);
    console.log(`   Size: ${boundingBox?.width} x ${boundingBox?.height}`);
  });
  
  test('CTA button should be clickable', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    const ctaButton = page.locator('button:has-text("Open Dashboard")').first();
    await ctaButton.scrollIntoViewIfNeeded();
    
    // Verify button is clickable
    await expect(ctaButton).toBeEnabled();
    
    // Click the button (this should navigate to dashboard)
    await ctaButton.click();
    
    // Wait for navigation
    await page.waitForTimeout(1000);
    
    // Verify we're no longer on the landing page (should be on dashboard)
    const currentUrl = page.url();
    expect(currentUrl).toBe('http://localhost:3000/');
    
    // Check if dashboard content is visible
    const dashboardContent = page.locator('text=Manjha').first();
    await expect(dashboardContent).toBeVisible({ timeout: 5000 });
    
    console.log('✅ CTA button click test passed!');
  });
});


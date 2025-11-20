#!/usr/bin/env python3
"""
Test script to verify CTA button visibility on Manjha landing page.
Tests the "Open Dashboard" button visibility and takes a screenshot.
"""

from playwright.sync_api import sync_playwright
import sys

def test_cta_visibility():
    """Test that the CTA button is visible on the landing page."""
    
    with sync_playwright() as p:
        # Launch browser in headless mode
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        
        try:
            # Navigate to the landing page
            print("Navigating to http://localhost:3000...")
            page.goto('http://localhost:3000', wait_until='networkidle', timeout=30000)
            
            # Wait for the page to fully load
            print("Waiting for page to load...")
            page.wait_for_load_state('networkidle')
            
            # Wait a bit more for animations/transitions
            page.wait_for_timeout(2000)
            
            # Take a full page screenshot
            screenshot_path = '/tmp/manjha_landing_page.png'
            print(f"Taking screenshot: {screenshot_path}")
            page.screenshot(path=screenshot_path, full_page=True)
            
            # Look for the CTA button - "Open Dashboard"
            # Try multiple selectors to find the button
            cta_selectors = [
                'button:has-text("Open Dashboard")',
                'button:has-text("Get Started")',
                'text=Open Dashboard',
                'text=Get Started',
                '[role="button"]:has-text("Open Dashboard")',
            ]
            
            cta_found = False
            cta_element = None
            
            for selector in cta_selectors:
                try:
                    element = page.locator(selector).first
                    if element.is_visible(timeout=1000):
                        cta_element = element
                        cta_found = True
                        print(f"✓ Found CTA button using selector: {selector}")
                        break
                except:
                    continue
            
            if not cta_found:
                # Try to find any button with "Dashboard" or "Started" text
                all_buttons = page.locator('button').all()
                print(f"Found {len(all_buttons)} buttons on the page")
                
                for i, button in enumerate(all_buttons):
                    try:
                        text = button.inner_text()
                        print(f"  Button {i+1}: '{text}'")
                        if 'Dashboard' in text or 'Started' in text:
                            if button.is_visible():
                                cta_element = button
                                cta_found = True
                                print(f"✓ Found CTA button: '{text}'")
                                break
                    except:
                        continue
            
            # Verify CTA is visible
            if cta_found and cta_element:
                # Check visibility properties
                is_visible = cta_element.is_visible()
                bounding_box = cta_element.bounding_box()
                
                print("\n" + "="*60)
                print("CTA VISIBILITY TEST RESULTS")
                print("="*60)
                print(f"✓ CTA Button Found: Yes")
                print(f"✓ Is Visible: {is_visible}")
                
                if bounding_box:
                    print(f"✓ Position: x={bounding_box['x']:.0f}, y={bounding_box['y']:.0f}")
                    print(f"✓ Size: {bounding_box['width']:.0f} x {bounding_box['height']:.0f}")
                
                # Get button text
                try:
                    button_text = cta_element.inner_text()
                    print(f"✓ Button Text: '{button_text}'")
                except:
                    pass
                
                # Check if button is in viewport
                viewport_size = page.viewport_size
                if bounding_box:
                    in_viewport = (
                        bounding_box['x'] >= 0 and
                        bounding_box['y'] >= 0 and
                        bounding_box['x'] + bounding_box['width'] <= viewport_size['width'] and
                        bounding_box['y'] + bounding_box['height'] <= viewport_size['height']
                    )
                    print(f"✓ In Viewport: {in_viewport}")
                
                print(f"✓ Screenshot saved: {screenshot_path}")
                print("="*60)
                
                if is_visible:
                    print("\n✅ TEST PASSED: CTA button is visible!")
                    return 0
                else:
                    print("\n❌ TEST FAILED: CTA button found but not visible!")
                    return 1
            else:
                print("\n" + "="*60)
                print("CTA VISIBILITY TEST RESULTS")
                print("="*60)
                print("❌ CTA Button Not Found")
                print(f"✓ Screenshot saved: {screenshot_path}")
                print("="*60)
                
                # Get page content for debugging
                print("\nPage title:", page.title())
                print("\nChecking page content...")
                body_text = page.locator('body').inner_text()
                if 'Dashboard' in body_text or 'Started' in body_text:
                    print("✓ Found 'Dashboard' or 'Started' text in page content")
                else:
                    print("✗ Did not find 'Dashboard' or 'Started' text in page content")
                
                print("\n❌ TEST FAILED: CTA button not found!")
                return 1
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1
        finally:
            browser.close()

if __name__ == '__main__':
    exit_code = test_cta_visibility()
    sys.exit(exit_code)


#!/usr/bin/env python3
"""
Enhanced test script to verify CTA button visibility on Manjha landing page.
Tests visibility, scrolls to button, and takes screenshots.
"""

from playwright.sync_api import sync_playwright
import sys

def test_cta_visibility_enhanced():
    """Test that the CTA button is visible and accessible on the landing page."""
    
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
            page.wait_for_timeout(2000)
            
            # Take initial screenshot
            screenshot_initial = '/tmp/manjha_landing_initial.png'
            page.screenshot(path=screenshot_initial, full_page=True)
            print(f"✓ Initial screenshot: {screenshot_initial}")
            
            # Find the CTA button
            cta_selectors = [
                'button:has-text("Open Dashboard")',
                'button:has-text("Get Started")',
                'text=Open Dashboard',
            ]
            
            cta_element = None
            for selector in cta_selectors:
                try:
                    element = page.locator(selector).first
                    if element.count() > 0:
                        cta_element = element
                        print(f"✓ Found CTA using selector: {selector}")
                        break
                except:
                    continue
            
            if not cta_element:
                print("❌ CTA button not found!")
                return 1
            
            # Check initial visibility
            is_initially_visible = cta_element.is_visible()
            bounding_box = cta_element.bounding_box()
            
            print("\n" + "="*60)
            print("CTA VISIBILITY TEST RESULTS")
            print("="*60)
            print(f"✓ CTA Button Found: Yes")
            print(f"✓ Initially Visible: {is_initially_visible}")
            
            if bounding_box:
                print(f"✓ Position: x={bounding_box['x']:.0f}, y={bounding_box['y']:.0f}")
                print(f"✓ Size: {bounding_box['width']:.0f} x {bounding_box['height']:.0f}")
            
            # Scroll to the button to ensure it's in viewport
            print("\nScrolling to CTA button...")
            cta_element.scroll_into_view_if_needed()
            page.wait_for_timeout(500)
            
            # Check visibility after scroll
            is_visible_after_scroll = cta_element.is_visible()
            bounding_box_after = cta_element.bounding_box()
            
            print(f"✓ Visible After Scroll: {is_visible_after_scroll}")
            
            if bounding_box_after:
                viewport_size = page.viewport_size
                in_viewport = (
                    bounding_box_after['y'] >= 0 and
                    bounding_box_after['y'] + bounding_box_after['height'] <= viewport_size['height'] + 100  # Allow some margin
                )
                print(f"✓ In Viewport After Scroll: {in_viewport}")
            
            # Take screenshot after scroll
            screenshot_scrolled = '/tmp/manjha_landing_scrolled.png'
            page.screenshot(path=screenshot_scrolled, full_page=True)
            print(f"✓ Screenshot after scroll: {screenshot_scrolled}")
            
            # Get button details
            try:
                button_text = cta_element.inner_text()
                print(f"✓ Button Text: '{button_text}'")
            except:
                pass
            
            # Check button is clickable
            try:
                is_enabled = cta_element.is_enabled()
                print(f"✓ Button Enabled: {is_enabled}")
            except:
                pass
            
            # Verify button styling (check if it has expected classes/styles)
            try:
                classes = cta_element.get_attribute('class') or ''
                print(f"✓ Button Classes: {classes[:100]}...")
            except:
                pass
            
            print("="*60)
            
            # Final verification
            if is_visible_after_scroll:
                print("\n✅ TEST PASSED: CTA button is visible and accessible!")
                print(f"   - Screenshots saved: {screenshot_initial}, {screenshot_scrolled}")
                return 0
            else:
                print("\n❌ TEST FAILED: CTA button not visible after scroll!")
                return 1
                
        except Exception as e:
            print(f"\n❌ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            return 1
        finally:
            browser.close()

if __name__ == '__main__':
    exit_code = test_cta_visibility_enhanced()
    sys.exit(exit_code)


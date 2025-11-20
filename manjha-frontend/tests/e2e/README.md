# E2E Tests for Manjha Trading Journal

This directory contains end-to-end tests for the Manjha application.

## Test Files

- `test_cta_visibility.py` - Python Playwright test for CTA button visibility (basic)
- `test_cta_visibility_enhanced.py` - Enhanced Python Playwright test with scrolling and detailed verification
- `test_cta_visibility.spec.ts` - TypeScript Playwright test suite (recommended for CI/CD)

## Running Tests

### Python Tests

```bash
# Basic test
python tests/e2e/test_cta_visibility.py

# Enhanced test
python tests/e2e/test_cta_visibility_enhanced.py
```

### TypeScript Tests (Playwright)

```bash
# Install Playwright if not already installed
npx playwright install

# Run tests
npx playwright test tests/e2e/test_cta_visibility.spec.ts

# Run with UI
npx playwright test tests/e2e/test_cta_visibility.spec.ts --ui
```

## Prerequisites

- Next.js dev server running on `http://localhost:3000`
- Python 3.x with Playwright installed: `pip install playwright && playwright install chromium`
- Node.js with Playwright: `npm install -D @playwright/test && npx playwright install`

## Test Results

Screenshots and test results are saved to `tests/e2e/test-results/` directory.


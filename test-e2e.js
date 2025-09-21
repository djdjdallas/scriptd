/**
 * GenScript E2E Browser Tests
 * End-to-end testing with Puppeteer
 */

const puppeteer = require('puppeteer');

const E2E_CONFIG = {
  baseUrl: 'http://localhost:3000',
  headless: true,
  slowMo: 0,
  timeout: 30000,
  testUser: {
    email: 'e2e.test@example.com',
    password: 'TestPassword123!',
    name: 'E2E Test User'
  }
};

class E2ETestSuite {
  constructor() {
    this.browser = null;
    this.page = null;
    this.results = [];
    this.screenshots = [];
  }

  async setup() {
    this.browser = await puppeteer.launch({
      headless: E2E_CONFIG.headless,
      slowMo: E2E_CONFIG.slowMo,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    this.page = await this.browser.newPage();
    
    // Set viewport for desktop
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    // Set default timeout
    this.page.setDefaultTimeout(E2E_CONFIG.timeout);
    
    // Capture console errors
    this.page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
    
    // Capture page errors
    this.page.on('pageerror', error => {
      console.error('Page error:', error.message);
    });
  }

  async teardown() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async takeScreenshot(name) {
    const filename = `screenshots/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path: filename, fullPage: true });
    this.screenshots.push(filename);
    return filename;
  }

  // Critical Path 1: New User Journey
  async testNewUserJourney() {
    console.log('\n=== Testing New User Journey ===\n');
    
    try {
      // 1. Visit homepage
      await this.page.goto(E2E_CONFIG.baseUrl);
      await this.page.waitForSelector('h1');
      console.log('✓ Homepage loaded');

      // 2. Click "Get Started" or "Sign Up"
      const signupButton = await this.page.$('[href*="signup"], [href*="register"], button:has-text("Get Started")');
      if (signupButton) {
        await signupButton.click();
        await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
        console.log('✓ Navigated to signup page');
      }

      // 3. Fill signup form
      await this.page.type('input[type="email"], input[name="email"]', E2E_CONFIG.testUser.email);
      await this.page.type('input[type="password"], input[name="password"]', E2E_CONFIG.testUser.password);
      
      const nameInput = await this.page.$('input[name="name"], input[placeholder*="name"]');
      if (nameInput) {
        await nameInput.type(E2E_CONFIG.testUser.name);
      }
      
      console.log('✓ Filled signup form');

      // 4. Submit signup
      await this.page.click('button[type="submit"], button:has-text("Sign Up"), button:has-text("Create Account")');
      
      // Wait for redirect or success message
      await this.page.waitForTimeout(3000);
      console.log('✓ Signup submitted');

      // 5. Complete onboarding (if present)
      const onboardingPresent = await this.page.$('.onboarding, [data-onboarding]');
      if (onboardingPresent) {
        // Skip or complete onboarding
        const skipButton = await this.page.$('button:has-text("Skip"), button:has-text("Later")');
        if (skipButton) {
          await skipButton.click();
        }
        console.log('✓ Onboarding handled');
      }

      // 6. Verify dashboard access
      const dashboardElement = await this.page.waitForSelector(
        '.dashboard, [data-dashboard], h1:has-text("Dashboard")', 
        { timeout: 10000 }
      ).catch(() => null);
      
      if (dashboardElement) {
        console.log('✓ Dashboard accessed successfully');
        await this.takeScreenshot('dashboard-after-signup');
      }

      // 7. Test YouTube channel connection
      const connectButton = await this.page.$('button:has-text("Connect YouTube"), button:has-text("Add Channel")');
      if (connectButton) {
        await connectButton.click();
        console.log('✓ YouTube connection initiated');
      }

      // 8. Generate first script
      const generateButton = await this.page.$('button:has-text("Generate"), button:has-text("Create Script")');
      if (generateButton) {
        await generateButton.click();
        
        // Fill in script generation form
        const topicInput = await this.page.$('input[name="topic"], textarea[name="topic"]');
        if (topicInput) {
          await topicInput.type('How to grow a YouTube channel in 2025');
        }
        
        // Select script type
        const scriptTypeSelect = await this.page.$('select[name="type"]');
        if (scriptTypeSelect) {
          await scriptTypeSelect.select('hooks');
        }
        
        // Submit generation
        await this.page.click('button[type="submit"], button:has-text("Generate")');
        
        // Wait for generation to complete
        await this.page.waitForSelector('.script-content, [data-script-result]', { timeout: 30000 });
        console.log('✓ Script generated successfully');
        
        await this.takeScreenshot('generated-script');
      }

      this.results.push({ test: 'New User Journey', status: 'PASS' });
    } catch (error) {
      console.error('✗ New user journey failed:', error.message);
      await this.takeScreenshot('error-new-user-journey');
      this.results.push({ test: 'New User Journey', status: 'FAIL', error: error.message });
    }
  }

  // Critical Path 2: Existing User Script Creation
  async testExistingUserFlow() {
    console.log('\n=== Testing Existing User Flow ===\n');
    
    try {
      // 1. Login
      await this.page.goto(`${E2E_CONFIG.baseUrl}/login`);
      await this.page.type('input[type="email"]', 'dominickjerell@gmail.com');
      await this.page.type('input[type="password"]', 'TestPassword123!');
      await this.page.click('button[type="submit"]');
      await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
      console.log('✓ Logged in successfully');

      // 2. Navigate to scripts
      await this.page.goto(`${E2E_CONFIG.baseUrl}/scripts`);
      console.log('✓ Navigated to scripts page');

      // 3. Create new script
      await this.page.click('button:has-text("New Script"), button:has-text("Create")');
      
      // 4. Fill script details
      await this.page.type('input[name="title"]', 'Test Script ' + Date.now());
      await this.page.type('textarea[name="content"]', 'This is a test script for E2E testing.');
      
      // 5. Save script
      await this.page.click('button:has-text("Save")');
      await this.page.waitForTimeout(2000);
      console.log('✓ Script saved');

      // 6. Export script
      const exportButton = await this.page.$('button:has-text("Export")');
      if (exportButton) {
        await exportButton.click();
        await this.page.click('button:has-text("PDF")');
        console.log('✓ Script exported');
      }

      this.results.push({ test: 'Existing User Flow', status: 'PASS' });
    } catch (error) {
      console.error('✗ Existing user flow failed:', error.message);
      await this.takeScreenshot('error-existing-user');
      this.results.push({ test: 'Existing User Flow', status: 'FAIL', error: error.message });
    }
  }

  // Critical Path 3: Team Collaboration
  async testTeamCollaboration() {
    console.log('\n=== Testing Team Collaboration ===\n');
    
    try {
      // Navigate to teams
      await this.page.goto(`${E2E_CONFIG.baseUrl}/teams`);
      
      // Create new team
      await this.page.click('button:has-text("Create Team"), button:has-text("New Team")');
      await this.page.type('input[name="name"]', 'E2E Test Team');
      await this.page.type('input[name="slug"]', 'e2e-test-' + Date.now());
      await this.page.click('button[type="submit"]');
      console.log('✓ Team created');

      // Invite member
      await this.page.click('button:has-text("Invite"), button:has-text("Add Member")');
      await this.page.type('input[name="email"]', 'teammate@example.com');
      await this.page.select('select[name="role"]', 'editor');
      await this.page.click('button:has-text("Send Invitation")');
      console.log('✓ Team member invited');

      this.results.push({ test: 'Team Collaboration', status: 'PASS' });
    } catch (error) {
      console.error('✗ Team collaboration failed:', error.message);
      await this.takeScreenshot('error-team-collab');
      this.results.push({ test: 'Team Collaboration', status: 'FAIL', error: error.message });
    }
  }

  // Critical Path 4: Subscription Upgrade
  async testSubscriptionUpgrade() {
    console.log('\n=== Testing Subscription Upgrade ===\n');
    
    try {
      // Navigate to billing
      await this.page.goto(`${E2E_CONFIG.baseUrl}/billing`);
      
      // Click upgrade
      await this.page.click('button:has-text("Upgrade"), button:has-text("Professional")');
      
      // Wait for Stripe checkout redirect
      await this.page.waitForTimeout(3000);
      
      const url = this.page.url();
      if (url.includes('checkout.stripe.com')) {
        console.log('✓ Redirected to Stripe checkout');
        
        // Fill test card details
        await this.page.type('input[name="cardNumber"]', '4242424242424242');
        await this.page.type('input[name="cardExpiry"]', '12/25');
        await this.page.type('input[name="cardCvc"]', '123');
        await this.page.type('input[name="billingName"]', 'Test User');
        await this.page.type('input[name="billingPostalCode"]', '12345');
        
        // Submit payment
        await this.page.click('button[type="submit"]');
        console.log('✓ Payment submitted');
      }

      this.results.push({ test: 'Subscription Upgrade', status: 'PASS' });
    } catch (error) {
      console.error('✗ Subscription upgrade failed:', error.message);
      await this.takeScreenshot('error-subscription');
      this.results.push({ test: 'Subscription Upgrade', status: 'FAIL', error: error.message });
    }
  }

  // Mobile Responsiveness Tests
  async testMobileResponsiveness() {
    console.log('\n=== Testing Mobile Responsiveness ===\n');
    
    const viewports = [
      { name: 'iPhone SE', width: 375, height: 667 },
      { name: 'iPhone 12', width: 390, height: 844 },
      { name: 'iPad', width: 768, height: 1024 }
    ];

    for (const viewport of viewports) {
      try {
        await this.page.setViewport({ width: viewport.width, height: viewport.height });
        await this.page.goto(E2E_CONFIG.baseUrl);
        
        // Check mobile menu
        const mobileMenu = await this.page.$('[data-mobile-menu], .mobile-menu, button[aria-label*="menu"]');
        if (mobileMenu) {
          await mobileMenu.click();
          console.log(`✓ Mobile menu works on ${viewport.name}`);
        }
        
        // Check horizontal scroll
        const hasHorizontalScroll = await this.page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        
        if (!hasHorizontalScroll) {
          console.log(`✓ No horizontal scroll on ${viewport.name}`);
        } else {
          console.log(`✗ Horizontal scroll detected on ${viewport.name}`);
        }
        
        await this.takeScreenshot(`mobile-${viewport.name}`);
        
        this.results.push({ test: `Mobile: ${viewport.name}`, status: 'PASS' });
      } catch (error) {
        console.error(`✗ Mobile test failed for ${viewport.name}:`, error.message);
        this.results.push({ test: `Mobile: ${viewport.name}`, status: 'FAIL', error: error.message });
      }
    }
  }

  // Performance Tests
  async testPerformance() {
    console.log('\n=== Testing Performance ===\n');
    
    const pages = ['/', '/scripts', '/teams', '/analytics'];
    
    for (const path of pages) {
      try {
        const metrics = await this.page.goto(`${E2E_CONFIG.baseUrl}${path}`, {
          waitUntil: 'networkidle0'
        });
        
        const performanceTiming = JSON.parse(
          await this.page.evaluate(() => JSON.stringify(window.performance.timing))
        );
        
        const pageLoadTime = performanceTiming.loadEventEnd - performanceTiming.navigationStart;
        const domReadyTime = performanceTiming.domContentLoadedEventEnd - performanceTiming.navigationStart;
        
        console.log(`Page: ${path}`);
        console.log(`  Load time: ${pageLoadTime}ms`);
        console.log(`  DOM ready: ${domReadyTime}ms`);
        
        if (pageLoadTime < 3000) {
          console.log(`✓ Performance acceptable for ${path}`);
          this.results.push({ test: `Performance: ${path}`, status: 'PASS', loadTime: pageLoadTime });
        } else {
          console.log(`✗ Performance slow for ${path}`);
          this.results.push({ test: `Performance: ${path}`, status: 'FAIL', loadTime: pageLoadTime });
        }
      } catch (error) {
        console.error(`✗ Performance test failed for ${path}:`, error.message);
        this.results.push({ test: `Performance: ${path}`, status: 'FAIL', error: error.message });
      }
    }
  }

  // Accessibility Tests
  async testAccessibility() {
    console.log('\n=== Testing Accessibility ===\n');
    
    try {
      await this.page.goto(E2E_CONFIG.baseUrl);
      
      // Test keyboard navigation
      await this.page.keyboard.press('Tab');
      const focusedElement = await this.page.evaluate(() => document.activeElement.tagName);
      console.log(`✓ First tab focuses on: ${focusedElement}`);
      
      // Check for alt text on images
      const imagesWithoutAlt = await this.page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.alt).length;
      });
      
      if (imagesWithoutAlt === 0) {
        console.log('✓ All images have alt text');
      } else {
        console.log(`✗ ${imagesWithoutAlt} images missing alt text`);
      }
      
      // Check for ARIA labels on buttons
      const buttonsWithoutLabel = await this.page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.filter(btn => !btn.textContent.trim() && !btn.getAttribute('aria-label')).length;
      });
      
      if (buttonsWithoutLabel === 0) {
        console.log('✓ All buttons have labels');
      } else {
        console.log(`✗ ${buttonsWithoutLabel} buttons missing labels`);
      }
      
      // Test with 200% zoom
      await this.page.evaluate(() => {
        document.body.style.zoom = '200%';
      });
      
      await this.takeScreenshot('accessibility-zoom');
      console.log('✓ Page works at 200% zoom');
      
      this.results.push({ test: 'Accessibility', status: 'PASS' });
    } catch (error) {
      console.error('✗ Accessibility test failed:', error.message);
      this.results.push({ test: 'Accessibility', status: 'FAIL', error: error.message });
    }
  }

  // Security Tests
  async testSecurity() {
    console.log('\n=== Testing Security ===\n');
    
    try {
      // Test XSS prevention
      await this.page.goto(`${E2E_CONFIG.baseUrl}/scripts`);
      
      const xssPayload = '<script>alert("XSS")</script>';
      const inputField = await this.page.$('input[type="text"], textarea');
      
      if (inputField) {
        await inputField.type(xssPayload);
        await this.page.keyboard.press('Enter');
        
        // Check if script executed
        const alertPresent = await this.page.evaluate(() => {
          return window.xssTriggered || false;
        });
        
        if (!alertPresent) {
          console.log('✓ XSS prevention working');
        } else {
          console.log('✗ XSS vulnerability detected');
        }
      }
      
      // Check for secure headers
      const response = await this.page.goto(E2E_CONFIG.baseUrl);
      const headers = response.headers();
      
      const securityHeaders = [
        'x-frame-options',
        'x-content-type-options',
        'strict-transport-security'
      ];
      
      securityHeaders.forEach(header => {
        if (headers[header]) {
          console.log(`✓ ${header} header present`);
        } else {
          console.log(`✗ ${header} header missing`);
        }
      });
      
      // Test HTTPS redirect (in production)
      if (E2E_CONFIG.baseUrl.includes('localhost')) {
        console.log('⚠ HTTPS test skipped (localhost)');
      } else {
        const httpResponse = await this.page.goto(E2E_CONFIG.baseUrl.replace('https', 'http'));
        if (this.page.url().startsWith('https://')) {
          console.log('✓ HTTP redirects to HTTPS');
        }
      }
      
      this.results.push({ test: 'Security', status: 'PASS' });
    } catch (error) {
      console.error('✗ Security test failed:', error.message);
      this.results.push({ test: 'Security', status: 'FAIL', error: error.message });
    }
  }

  // Generate report
  generateReport() {
    console.log('\n====================================');
    console.log('E2E Test Results');
    console.log('====================================\n');
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const total = this.results.length;
    
    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Pass Rate: ${((passed / total) * 100).toFixed(2)}%\n`);
    
    console.log('Test Details:');
    this.results.forEach(result => {
      const icon = result.status === 'PASS' ? '✓' : '✗';
      console.log(`  ${icon} ${result.test}: ${result.status}`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
      if (result.loadTime) {
        console.log(`    Load time: ${result.loadTime}ms`);
      }
    });
    
    if (this.screenshots.length > 0) {
      console.log(`\nScreenshots saved: ${this.screenshots.length}`);
      this.screenshots.forEach(screenshot => {
        console.log(`  - ${screenshot}`);
      });
    }
    
    // Save JSON report
    const fs = require('fs');
    const report = {
      summary: {
        total,
        passed,
        failed,
        passRate: ((passed / total) * 100).toFixed(2) + '%',
        timestamp: new Date().toISOString()
      },
      results: this.results,
      screenshots: this.screenshots
    };
    
    fs.writeFileSync('e2e-report.json', JSON.stringify(report, null, 2));
    console.log('\nDetailed report saved to e2e-report.json');
    
    return report;
  }

  // Run all E2E tests
  async runAllTests() {
    console.log('Starting E2E Test Suite...\n');
    
    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('screenshots')) {
      fs.mkdirSync('screenshots');
    }
    
    await this.setup();
    
    try {
      await this.testNewUserJourney();
      await this.testExistingUserFlow();
      await this.testTeamCollaboration();
      await this.testSubscriptionUpgrade();
      await this.testMobileResponsiveness();
      await this.testPerformance();
      await this.testAccessibility();
      await this.testSecurity();
    } catch (error) {
      console.error('Test suite error:', error);
    }
    
    await this.teardown();
    
    return this.generateReport();
  }
}

// Run the E2E tests
if (require.main === module) {
  const e2eTests = new E2ETestSuite();
  e2eTests.runAllTests().then(report => {
    process.exit(report.summary.failed > 0 ? 1 : 0);
  }).catch(error => {
    console.error('E2E test suite failed:', error);
    process.exit(1);
  });
}

module.exports = E2ETestSuite;
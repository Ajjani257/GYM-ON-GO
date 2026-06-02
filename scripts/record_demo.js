import puppeteer from 'puppeteer';
import { PuppeteerScreenRecorder } from 'puppeteer-screen-recorder';

const wait = (ms) => new Promise(r => setTimeout(r, ms));

async function record() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=375,812', '--disable-dev-shm-usage', '--disable-gpu']
  });

  const page = await browser.newPage();
  
  // Emulate iPhone
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.setUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1');

  const recorder = new PuppeteerScreenRecorder(page, {
    followNewTab: true,
    fps: 30,
    videoFrame: { width: 375, height: 812 }
  });

  console.log('Starting recording...');
  await recorder.start('public/demo.mp4');

  try {
    // 1. Homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await wait(2000);

    // 2. Click "Find a gym near you"
    console.log('Clicking to find gyms...');
    await page.click('.btn-primary');
    await wait(2000);

    // Scroll to see gyms
    await page.evaluate(() => window.scrollBy({ top: 300, behavior: 'smooth' }));
    await wait(2000);

    // 3. Click first gym
    console.log('Opening first gym...');
    await page.click('.gym-card');
    await wait(2000);
    
    // Scroll a bit
    await page.evaluate(() => window.scrollBy({ top: 400, behavior: 'smooth' }));
    await wait(1500);

    // 4. Click Sign in to book
    console.log('Clicking sign in...');
    await page.click('.btn-book');
    await wait(2000);

    // 5. Fill credentials
    console.log('Logging in...');
    await page.type('input[type="email"]', 'test@example.com', { delay: 100 });
    await page.type('input[type="password"]', 'password123', { delay: 100 });
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const loginBtn = buttons.find(b => b.textContent.includes('Sign in'));
      if(loginBtn) loginBtn.click();
    });
    
    // Wait for Dashboard
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    console.log('On Dashboard...');
    await wait(2000);

    // Scroll dashboard
    await page.evaluate(() => window.scrollBy({ top: 200, behavior: 'smooth' }));
    await wait(2000);
    
    // Click Saved Gyms
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('.tab'));
      const savedTab = tabs.find(t => t.textContent.includes('Saved Gyms'));
      if(savedTab) savedTab.click();
    });
    await wait(2000);

    console.log('Demo completed!');
  } catch (err) {
    console.error('Error during recording:', err);
  } finally {
    await recorder.stop();
    await browser.close();
    console.log('Recording saved to public/demo.mp4');
  }
}

record();

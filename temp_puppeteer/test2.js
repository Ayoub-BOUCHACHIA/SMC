const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER_ERROR:', err));
  
  await page.goto('http://localhost:8080');
  
  // Wait for the API setup banner and inject a fake or real API key
  await page.evaluate(() => {
    localStorage.setItem('smc_twelvedata_api_key', '1a2b3c4d5e6f');
    // Reload to apply key
    window.location.reload();
  });
  
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 5000));
  
  await browser.close();
})();

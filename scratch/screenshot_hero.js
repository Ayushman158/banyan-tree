const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  // Mobile
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const btn = await page.$('.splash-btn');
    if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 3000)); }
    await page.screenshot({ path: 'scratch/mobile-hero.png' });
    await page.close();
  }

  // Desktop
  {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 1 });
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    const btn = await page.$('.splash-btn');
    if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 3000)); }
    await page.screenshot({ path: 'scratch/desktop-hero.png' });
    await page.close();
  }

  await browser.close();
})();

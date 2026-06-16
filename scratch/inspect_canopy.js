const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 390,
    height: 844,
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3
  });
  
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.click('.splash-btn');
  await new Promise(r => setTimeout(r, 2000));
  
  const labels = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.category-label')).map((el, idx) => {
      const rect = el.getBoundingClientRect();
      return {
        idx,
        text: el.textContent.trim(),
        x: rect.x + rect.width / 2,
        y: rect.y + rect.height / 2,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
      };
    });
  });
  
  console.log('Category Labels in DOM:');
  console.log(JSON.stringify(labels, null, 2));
  
  await browser.close();
})();

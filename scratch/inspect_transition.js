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

  page.on('console', msg => {
    console.log(`PAGE LOG:`, msg.text());
  });
  
  await page.goto('http://localhost:3003/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.click('.splash-btn');
  await new Promise(r => setTimeout(r, 5000));
  
  // Register click tracking
  await page.evaluate(() => {
    window.clickedElements = [];
    document.addEventListener('click', (e) => {
      let path = [];
      let el = e.target;
      while (el) {
        path.push(el.tagName + (el.className ? '.' + el.className.split(' ').join('.') : ''));
        el = el.parentElement;
      }
      window.clickedElements.push({
        time: Date.now(),
        tagName: e.target.tagName,
        className: e.target.className,
        textContent: e.target.textContent.trim(),
        path: path.reverse().join(' > ')
      });
      console.log('--- CLICK EVENT FIRED ---', e.target.tagName, e.target.className, e.target.textContent.trim());
    }, true);
  });
  
  console.log('Clicking Mental Health...');
  await page.click('.category-label');
  
  // Let's monitor state for 5 seconds
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 100));
    const info = await page.evaluate(() => {
      // Find active elements, phase, etc.
      const crumb = document.querySelector('.crumb');
      const crumbText = crumb ? crumb.textContent.trim().replace(/\s+/g, ' ') : '';
      return {
        crumbText,
        clicked: window.clickedElements
      };
    });
    console.log(`t = ${i * 100}ms | Crumb: "${info.crumbText}" | Clicks: ${info.clicked.length}`);
    if (info.clicked.length > 1) {
      console.log('Multiple clicks detected! Details:', info.clicked);
      break;
    }
  }
  
  await browser.close();
})();

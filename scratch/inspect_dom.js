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
  await new Promise(r => setTimeout(r, 5000));
  
  const info = await page.evaluate(() => {
    const wrapper = document.querySelector('.roots-group-wrapper');
    const dotGroup = document.querySelector('.root-node-group');
    const dot = document.querySelector('.root-node-dot');
    
    return {
      wrapper: {
        opacity: window.getComputedStyle(wrapper).opacity,
        pointerEvents: window.getComputedStyle(wrapper).pointerEvents,
        transform: window.getComputedStyle(wrapper).transform
      },
      dotGroup: {
        opacity: window.getComputedStyle(dotGroup).opacity,
        pointerEvents: window.getComputedStyle(dotGroup).pointerEvents,
        transform: window.getComputedStyle(dotGroup).transform
      },
      dot: {
        opacity: window.getComputedStyle(dot).opacity,
        pointerEvents: window.getComputedStyle(dot).pointerEvents,
        transform: window.getComputedStyle(dot).transform
      }
    };
  });
  
  console.log('DOM Info before click:');
  console.log(JSON.stringify(info, null, 2));
  
  await browser.close();
})();

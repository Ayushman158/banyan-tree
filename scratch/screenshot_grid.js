const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 900, deviceScaleFactor: 2 });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  const btn = await page.$('.splash-btn');
  if (btn) { await btn.click(); await new Promise(r => setTimeout(r, 3000)); }

  // Inject a percentage grid overlay onto the canopy-view-container
  await page.evaluate(() => {
    const container = document.querySelector('.canopy-view-container');
    if (!container) return;
    // Hide existing pills for clarity
    document.querySelectorAll('.category-interactive-group').forEach(el => el.style.display = 'none');

    const grid = document.createElement('div');
    grid.style.position = 'absolute';
    grid.style.inset = '0';
    grid.style.zIndex = '999';
    grid.style.pointerEvents = 'none';

    for (let x = 0; x <= 100; x += 10) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.left = x + '%';
      line.style.top = '0';
      line.style.bottom = '0';
      line.style.width = '1px';
      line.style.background = 'rgba(255,0,0,0.8)';
      const label = document.createElement('span');
      label.textContent = x;
      label.style.position = 'absolute';
      label.style.top = '2px';
      label.style.left = '2px';
      label.style.color = 'red';
      label.style.fontSize = '20px';
      label.style.fontWeight = 'bold';
      label.style.background = 'rgba(255,255,255,0.7)';
      label.style.fontFamily = 'monospace';
      line.appendChild(label);
      grid.appendChild(line);
    }
    for (let y = 0; y <= 100; y += 10) {
      const line = document.createElement('div');
      line.style.position = 'absolute';
      line.style.top = y + '%';
      line.style.left = '0';
      line.style.right = '0';
      line.style.height = '1px';
      line.style.background = 'rgba(0,150,255,0.8)';
      const label = document.createElement('span');
      label.textContent = y;
      label.style.position = 'absolute';
      label.style.left = '2px';
      label.style.top = '2px';
      label.style.color = '#0096ff';
      label.style.fontSize = '20px';
      label.style.fontWeight = 'bold';
      label.style.background = 'rgba(255,255,255,0.7)';
      label.style.fontFamily = 'monospace';
      line.appendChild(label);
      grid.appendChild(line);
    }
    container.appendChild(grid);
  });

  await page.screenshot({ path: 'scratch/desktop-grid.png' });
  await browser.close();
})();

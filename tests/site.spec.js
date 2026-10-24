const { test, expect } = require('@playwright/test');
const fs = require('node:fs');

test('home shows development status, real images and working navigation', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page).toHaveTitle(/Finnish Garage Simulator.*kehityksessä/);
  await expect(page.locator('.status-strip')).toContainText('Julkista demoa ei vielä ole saatavilla.');
  await expect(page.locator('#kehitys h3')).toContainText('Demoa ei vielä ole.');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('a[href$=".zip"],a[href$=".exe"]')).toHaveCount(0);
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/${testInfo.project.name}-home.png`, fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const menu = page.getByRole('button', { name: /Valikko/ });
  if (testInfo.project.name !== 'desktop') {
    await expect(menu).toBeVisible();
    await menu.click();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#navigation').getByRole('link', { name: 'Kehitys', exact: true }).click();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(page).toHaveURL(/#kehitys$/);
    await menu.click();
    await page.keyboard.press('Escape');
    await expect(menu).toBeFocused();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
  } else {
    await expect(page.locator('#navigation')).toBeVisible();
  }
  const faq = page.locator('details').filter({ has: page.locator('summary', { hasText: 'Voiko peliä tai demoa jo ladata?' }) });
  await faq.locator('summary').click();
  await expect(faq).toHaveAttribute('open', '');
  await expect(faq.locator('p')).toContainText('Ei.');
  expect(errors).toEqual([]);
});

test('content pages, old URL and metadata remain consistent', async ({ page }) => {
  for (const path of ['/pelista.html', '/ohjaimet.html', '/tietosuoja.html', '/kayttoehdot.html', '/404.html']) {
    const response = await page.goto(path);
    expect(response.status()).toBe(200); // Local HTTP server serves the custom 404 document as a file.
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('.status-strip')).toContainText('Julkista demoa ei vielä ole saatavilla.');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const raw of await page.locator('script[type="application/ld+json"]').allTextContents()) expect(JSON.parse(raw)['@type']).toBe('WebPage');
  }
  await page.goto('/fpv-rc-auto.html');
  await expect(page).toHaveURL(/pelista.html$/);
  expect(fs.readFileSync('CNAME', 'utf8').trim()).toBe('nordhash.fi');
});

test('mobile navigation and content work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4173/');
  await expect(page.locator('#navigation')).toBeVisible();
  await expect(page.locator('.menu-toggle')).toBeHidden();
  await page.locator('#navigation').getByRole('link', { name: 'Kehitys', exact: true }).click();
  await expect(page).toHaveURL(/#kehitys$/);
  await context.close();
});

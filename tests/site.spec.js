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
  await expect(page.locator('.gallery-grid img')).toHaveCount(4);
  await expect(page.locator('.hero-visual img')).toHaveAttribute('src', 'assets/markka-gt-012.png');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://nordhash.fi/assets/markka-gt-012.png');
  await expect(page.locator('form')).toHaveCount(0);
  await expect(page.locator('a[href$=".zip"],a[href$=".exe"]')).toHaveCount(0);
  for (const image of await page.locator('main img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(img => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `test-results/${testInfo.project.name}-hero.png` });
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

const consentKey = 'fgs.analytics-consent.v1';
const tagUrl = 'https://www.googletagmanager.com/gtag/js?id=G-F93778VN28';
async function stubGoogle(page) {
  await page.route('https://www.googletagmanager.com/gtag/js?**', route => route.fulfill({
    contentType: 'application/javascript',
    body: "window.__tagLoaded = true; document.cookie = '_ga=GA1.1.test; path=/; SameSite=Lax';"
  }));
}

test('analytics is opt-in, refusal persists, consent loads correct tag and withdrawal removes it', async ({ page, context }) => {
  const google = [];
  page.on('request', request => { if (/google(tagmanager|-analytics)\.com/.test(request.url())) google.push(request.url()); });
  await stubGoogle(page);
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Analytiikka-asetukset' })).toBeVisible();
  await expect(page.locator('#fgs-google-tag')).toHaveCount(0);
  expect(google).toEqual([]);
  await page.getByRole('button', { name: 'Vain välttämättömät' }).click();
  await page.reload();
  await expect(page.getByRole('region', { name: 'Analytiikka-asetukset' })).toBeHidden();
  expect(google).toEqual([]);
  for (const path of ['/pelista.html', '/ohjaimet.html', '/tietosuoja.html', '/kayttoehdot.html', '/404.html']) {
    await page.goto(path);
    await expect(page.locator('#fgs-google-tag')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Evästeasetukset' })).toBeVisible();
  }
  expect(google).toEqual([]);
  await page.getByRole('button', { name: 'Evästeasetukset' }).click();
  await page.getByRole('button', { name: 'Hyväksy analytiikka' }).click();
  await expect.poll(() => page.evaluate(() => window.__tagLoaded)).toBe(true);
  expect(google).toEqual([tagUrl]);
  const commands = await page.evaluate(() => window.dataLayer.map(args => Array.from(args)));
  expect(commands.find(args => args[0] === 'consent' && args[1] === 'default')[2].analytics_storage).toBe('denied');
  expect(commands.find(args => args[0] === 'consent' && args[1] === 'update')[2]).toMatchObject({ analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
  expect(commands.filter(args => args[0] === 'config')).toHaveLength(1);
  expect(commands.find(args => args[0] === 'config')[1]).toBe('G-F93778VN28');
  expect((await context.cookies()).some(cookie => cookie.name === '_ga')).toBe(true);
  await page.goto('/pelista.html');
  await expect.poll(() => page.evaluate(() => window.__tagLoaded)).toBe(true);
  expect(google).toHaveLength(2);
  await page.getByRole('button', { name: 'Evästeasetukset' }).click();
  await Promise.all([page.waitForEvent('load'), page.getByRole('button', { name: 'Vain välttämättömät' }).click()]);
  await expect(page.locator('#fgs-google-tag')).toHaveCount(0);
  expect(google).toHaveLength(2);
  expect((await context.cookies()).some(cookie => /^_ga/.test(cookie.name))).toBe(false);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).value, consentKey)).toBe('rejected');
});

test('expired consent and unavailable storage do not silently enable analytics', async ({ page, browser }) => {
  await page.addInitScript(key => localStorage.setItem(key, JSON.stringify({ value: 'accepted', expires: Date.now() - 1 })), consentKey);
  await page.goto('/');
  await expect(page.getByRole('region', { name: 'Analytiikka-asetukset' })).toBeVisible();
  await expect(page.locator('#fgs-google-tag')).toHaveCount(0);
  const context = await browser.newContext();
  const restricted = await context.newPage();
  await restricted.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'getItem', { value() { throw new Error('blocked'); } });
    Object.defineProperty(Storage.prototype, 'setItem', { value() { throw new Error('blocked'); } });
  });
  await stubGoogle(restricted);
  await restricted.goto('http://127.0.0.1:4173/');
  await expect(restricted.locator('#fgs-google-tag')).toHaveCount(0);
  await restricted.getByRole('button', { name: 'Hyväksy analytiikka' }).click();
  await expect.poll(() => restricted.evaluate(() => window.__tagLoaded)).toBe(true);
  await context.close();
});

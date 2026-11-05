import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const storageKey = 'groom-glam-appointments-v1';
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(new Date('2026-11-05T05:00:00Z'));
});

async function chooseServiceAndBarber(page: Page) {
  const haircut = page.getByRole('button', { name: /Hair & styling Signature haircut/ });
  if ((await haircut.getAttribute('aria-pressed')) !== 'true') await haircut.click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /Barber A Hair & styling/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
}

test('complete customer and owner lifecycle: create, block overlap, edit, reschedule, cancel, walk-in, persist, complete, reset', async ({
  page,
}) => {
  await page.goto('/services');
  await page.getByRole('link', { name: 'Book Signature haircut', exact: true }).click();
  await expect(
    page.getByRole('button', { name: /Hair & styling Signature haircut/ }),
  ).toHaveAttribute('aria-pressed', 'true');
  await chooseServiceAndBarber(page);
  await expect(
    page.getByRole('button', { name: /^Monday,? 9 November 2026, salon closed$/, exact: true }),
  ).toBeDisabled();
  await expect(
    page.getByRole('button', { name: /^Wednesday,? 4 November 2026$/, exact: true }),
  ).toBeDisabled();
  await page.getByRole('button', { name: /^Friday,? 6 November 2026$/, exact: true }).click();
  await page.getByRole('button', { name: '4:00 PM', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('highlighted');
  await page.getByLabel('Your name').fill('Demo Visitor');
  await page.getByLabel('Phone number').fill('123');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByText('Enter a valid Pakistani phone number')).toBeVisible();
  await page.getByLabel('Phone number').fill('+92 300 0000000');
  await page
    .getByLabel('Anything we should know?')
    .fill('Fictional customer for the automated demo audit.');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Back', exact: true }).click();
  await expect(page.getByLabel('Your name')).toHaveValue('Demo Visitor');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: 'Confirm demo booking', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Your time is reserved.' })).toBeVisible();
  await expect(
    page.getByText('No real appointment or notification has been sent.', { exact: false }),
  ).toBeVisible();
  let records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  const created = records.find((a: { name: string }) => a.name === 'Demo Visitor');
  expect(created.barberId).toBe('barber-a');
  await page.getByRole('link', { name: 'Owner Demo' }).click();
  await page.getByLabel('Date', { exact: true }).fill('2026-11-06');
  await expect(page.getByRole('button', { name: 'Demo Visitor', exact: true })).toBeVisible();
  await page.goto('/book');
  await chooseServiceAndBarber(page);
  await page.getByRole('button', { name: /^Friday,? 6 November 2026$/, exact: true }).click();
  await expect(page.getByRole('button', { name: '4:00 PM', exact: true })).toHaveCount(0);
  await page.goto('/owner-demo');
  await page.getByLabel('Date', { exact: true }).fill('2026-11-06');
  await page.getByRole('button', { name: 'Demo Visitor', exact: true }).click();
  await page.getByRole('button', { name: 'Edit details', exact: true }).click();
  await page.getByLabel('Phone number').fill('0311 0000000');
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Demo Visitor' })).toContainText(
    '0311 0000000',
  );
  await page.getByRole('button', { name: 'Demo Visitor', exact: true }).click();
  await page.getByRole('button', { name: 'Reschedule', exact: true }).click();
  await expect(page.getByRole('button', { name: '4:00 PM', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: /^Saturday,? 7 November 2026$/, exact: true }).click();
  await page.getByRole('button', { name: '5:00 PM', exact: true }).click();
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByLabel('Date', { exact: true })).toHaveValue('2026-11-07');
  await expect(page.getByRole('row').filter({ hasText: 'Demo Visitor' })).toContainText('5:00 PM');
  await page.getByRole('button', { name: 'Demo Visitor', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel appointment', exact: true }).click();
  await page.getByRole('button', { name: 'Keep appointment', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Demo Visitor' })).toContainText(
    'Confirmed',
  );
  await page.getByRole('button', { name: 'Demo Visitor', exact: true }).click();
  await page.getByRole('button', { name: 'Cancel appointment', exact: true }).click();
  await page.getByRole('button', { name: 'Yes, cancel appointment', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Demo Visitor' })).toContainText(
    'Cancelled',
  );
  await page.goto('/book');
  await chooseServiceAndBarber(page);
  await page.getByRole('button', { name: /^Saturday,? 7 November 2026$/, exact: true }).click();
  await expect(page.getByRole('button', { name: '5:00 PM', exact: true })).toBeEnabled();
  await page.goto('/owner-demo');
  await page.getByRole('button', { name: 'Add walk-in', exact: true }).click();
  await page.getByLabel('Your name').fill('Walk-in Demo');
  await page.getByLabel('Phone number').fill('0300 0000000');
  await page.getByRole('button', { name: 'Next: appointment time' }).click();
  await page.getByRole('button', { name: /^Friday,? 6 November 2026$/, exact: true }).click();
  await page.getByRole('button', { name: '5:30 PM', exact: true }).click();
  await page.getByRole('button', { name: 'Add walk-in', exact: true }).last().click();
  await expect(page.getByRole('button', { name: 'Walk-in Demo', exact: true })).toBeVisible();
  await page.reload();
  await page.getByLabel('Date', { exact: true }).fill('2026-11-06');
  await expect(page.getByRole('button', { name: 'Walk-in Demo', exact: true })).toBeVisible();
  await page.getByLabel('Search appointments').fill('03000000000');
  await expect(page.getByRole('button', { name: 'Walk-in Demo', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Walk-in Demo', exact: true }).click();
  await page.getByRole('button', { name: 'Mark completed', exact: true }).click();
  await expect(page.getByRole('row').filter({ hasText: 'Walk-in Demo' })).toContainText(
    'Completed',
  );
  records = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(records.find((a: { name: string }) => a.name === 'Walk-in Demo').barberId).toBe(
    'barber-a',
  );
  await page.getByRole('button', { name: 'Reset Demo Data', exact: true }).click();
  await page.getByRole('button', { name: 'Reset demo data', exact: true }).last().click();
  await expect(
    page.getByText('The original sample appointments are ready.', { exact: false }),
  ).toBeVisible();
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).length, storageKey),
  ).toBe(7);
});

test('cross-tab revalidation prevents a stale review from double-booking', async ({
  page,
  context,
}) => {
  await page.goto('/book');
  await chooseServiceAndBarber(page);
  await page.getByRole('button', { name: /^Friday,? 6 November 2026$/, exact: true }).click();
  await page.getByRole('button', { name: '4:00 PM', exact: true }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByLabel('Your name').fill('Stale Review Demo');
  await page.getByLabel('Phone number').fill('0300 0000000');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  const other = await context.newPage();
  await other.clock.setFixedTime(new Date('2026-11-05T05:00:00Z'));
  await other.goto('/owner-demo');
  await other.evaluate((key) => {
    const records = JSON.parse(localStorage.getItem(key)!);
    records.push({
      id: 'race-test',
      reference: 'GG-RACEDEMO',
      name: 'Other Tab Demo',
      phone: '0300 0000000',
      notes: '',
      serviceId: 'haircut',
      barberId: 'barber-a',
      date: '2026-11-06',
      time: 960,
      status: 'Confirmed',
      source: 'Online',
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem(key, JSON.stringify(records));
  }, storageKey);
  await page.getByRole('button', { name: 'Confirm demo booking', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('no longer available');
  await expect(page.getByRole('button', { name: 'Choose another time' })).toBeVisible();
});

test('malformed storage recovers and inaccessible storage shows a clear persistence notice', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page.evaluate((key) => localStorage.setItem(key, '{broken-json'), storageKey);
  await page.reload();
  await expect(page.getByRole('status')).toContainText('could not be read');
  await page.goto('/owner-demo');
  await expect(page.getByRole('button', { name: 'Sample Guest 01', exact: true })).toBeVisible();
  const noStorage = await context.newPage();
  await noStorage.addInitScript(() => {
    Object.defineProperty(Storage.prototype, 'setItem', {
      value: () => {
        throw new Error('Storage unavailable');
      },
    });
  });
  await noStorage.goto('/');
  await expect(noStorage.getByRole('status')).toContainText(
    'Changes will last for this visit only',
  );
});

test('mobile navigation and accessible dialogs support keyboard dismissal and focus', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await expect(page.getByRole('navigation')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Open menu' })).toBeFocused();
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('navigation').getByRole('link', { name: 'Services', exact: true }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await page.goto('/owner-demo');
  await page.getByRole('button', { name: 'Add walk-in', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  for (let i = 0; i < 12; i++) await page.keyboard.press('Tab');
  expect(
    await page.evaluate(() => document.querySelector('dialog')?.contains(document.activeElement)),
  ).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Add walk-in', exact: true })).toBeFocused();
});

for (const width of [390, 768, 1440]) {
  test(`all booking stages and owner dialog are accessible at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    await page.goto('/book');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('choose at least one service');
    await chooseServiceAndBarber(page);
    const headingBox = await page
      .getByRole('heading', { name: 'Make time for yourself.' })
      .boundingBox();
    expect(headingBox!.y).toBeGreaterThan(75);
    expect(headingBox!.y).toBeLessThan(250);
    await page.getByRole('button', { name: /^Friday,? 6 November 2026$/, exact: true }).click();
    await page.getByRole('button', { name: '4:00 PM', exact: true }).click();
    const auditStage = async (name: string) => {
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({ id: v.id, nodes: v.nodes.map((n) => n.failureSummary) })),
        name,
      ).toEqual([]);
      // Start full-page captures at the top so fixed/sticky elements are not
      // painted at the old scroll offset in Chromium's screenshot compositor.
      if (name !== 'owner-editor') {
        await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
      }
      await page.screenshot({
        path: `audit/screenshots/${name}-${width}.png`,
        fullPage: name !== 'owner-editor',
      });
    };
    await auditStage('booking-calendar');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Your name').fill('Mobile Demo Guest');
    await page.getByLabel('Phone number').fill('0300 0000000');
    await auditStage('booking-details');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await auditStage('booking-review');
    await page.getByRole('button', { name: 'Confirm demo booking', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your time is reserved.' })).toBeVisible();
    await auditStage('booking-confirmation');
    await page.goto('/owner-demo');
    await page.getByRole('button', { name: 'Add walk-in', exact: true }).click();
    await page.getByLabel('Your name').fill('Modal Demo');
    await page.getByLabel('Phone number').fill('0300 0000000');
    await page.getByRole('button', { name: 'Next: appointment time' }).click();
    await auditStage('owner-editor');
  });

  test(`visual, accessibility and navigation audit at ${width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1000 });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    for (const route of [
      '/',
      '/services',
      '/barbers',
      '/about',
      '/contact',
      '/book',
      '/owner-demo',
    ]) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
        `${route} overflow`,
      ).toBe(true);
      await expect(page.locator('main h1')).toHaveCount(1);
      expect(await page.locator('a[href="#"]').count()).toBe(0);
      expect(
        await page
          .locator('img')
          .evaluateAll((images) =>
            images
              .filter(
                (image) =>
                  !(image as HTMLImageElement).complete ||
                  !(image as HTMLImageElement).naturalWidth,
              )
              .map((image) => image.getAttribute('src')),
          ),
      ).toEqual([]);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
        .analyze();
      expect(
        results.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => ({ html: n.html, failure: n.failureSummary })),
        })),
        `${route} accessibility`,
      ).toEqual([]);
      if (['/', '/owner-demo', '/book'].includes(route))
        await page.screenshot({
          path: `audit/screenshots/${route === '/' ? 'home' : route.slice(1)}-${width}.png`,
          fullPage: true,
        });
    }
    expect(errors).toEqual([]);
  });
}

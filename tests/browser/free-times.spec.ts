import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function selectNinetyMinuteVisit(page: Page, barber = 'a') {
  await page.goto('/book');
  await page.getByRole('button', { name: /Hair & styling Signature haircut/ }).click();
  await page.getByRole('button', { name: /Hair & styling Fade & finish/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  if (barber === 'a') await page.getByRole('button', { name: /Barber A Hair & styling/ }).click();
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /^Saturday,? 7 November 2026$/ }).click();
}

for (const width of [390, 1440]) {
  test(`only free starts appear after a customer's 90-minute visit at ${width}px`, async ({
    page,
  }) => {
    await page.clock.setFixedTime(new Date('2026-11-05T05:00:00Z'));
    await page.setViewportSize({ width, height: 1000 });
    await selectNinetyMinuteVisit(page);
    await page.getByRole('button', { name: '2:00 PM', exact: true }).click();
    await expect(page.locator('.selected-time-summary')).toContainText('2:00 PM–3:30 PM');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Your name').fill('Ninety Minute Demo');
    await page.getByLabel('Phone number').fill('0300 0000000');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Confirm demo booking', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your time is reserved.' })).toBeVisible();

    await selectNinetyMinuteVisit(page);
    for (const time of [
      '12:45 PM',
      '1:00 PM',
      '1:15 PM',
      '1:30 PM',
      '1:45 PM',
      '2:00 PM',
      '2:15 PM',
      '2:30 PM',
      '2:45 PM',
      '3:00 PM',
      '3:15 PM',
    ]) {
      await expect(page.getByRole('button', { name: time, exact: true })).toHaveCount(0);
    }
    await expect(page.getByRole('button', { name: '12:30 PM', exact: true })).toBeEnabled();
    await expect(page.getByRole('button', { name: '3:30 PM', exact: true })).toBeEnabled();
    await expect(page.locator('.time-grid button:disabled')).toHaveCount(0);
    await expect(page.locator('.availability-note')).toContainText(
      'Barber A is free for your full 90-minute visit',
    );
    await page.getByRole('button', { name: '3:30 PM', exact: true }).click();
    await expect(page.locator('.selected-time-summary')).toContainText('3:30 PM–5:00 PM');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({ path: `audit/screenshots/free-times-${width}.png`, fullPage: true });

    // Another barber can still work at 2 PM; a booking only blocks its assigned barber.
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await page.getByRole('button', { name: /Any available barber More flexibility/ }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('button', { name: '2:00 PM', exact: true })).toBeEnabled();
  });
}

test('fully booked days show an empty state instead of unavailable time buttons', async ({
  page,
}) => {
  await page.clock.setFixedTime(new Date('2026-11-05T05:00:00Z'));
  await page.goto('/');
  await page.evaluate(() => {
    const fullDay = Array.from({ length: 16 }, (_, i) => ({
      id: `busy-${i}`,
      reference: `GG-BUSY${i}`,
      serviceIds: ['haircut'],
      barberId: 'barber-a',
      date: '2026-11-07',
      time: 720 + i * 45,
      name: 'Busy Day Demo',
      phone: '0300 0000000',
      notes: '',
      status: 'Confirmed',
      source: 'Sample',
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem('groom-glam-appointments-v1', JSON.stringify(fullDay));
  });
  await selectNinetyMinuteVisit(page);
  await expect(
    page.getByText('No times available for this selection.', { exact: false }),
  ).toBeVisible();
  await expect(page.locator('.time-grid button')).toHaveCount(0);
  await expect(page.locator('.time-group')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('select an available date and time');
});

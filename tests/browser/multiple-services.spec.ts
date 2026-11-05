import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const width of [390, 1440]) {
  test(`multiple services toggle, reserve, persist, edit, and cancel at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(90000);
    await page.clock.setFixedTime(new Date('2026-11-05T05:00:00Z'));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/book?service=haircut');
    const haircut = page.getByRole('button', { name: /Hair & styling Signature haircut/ });
    const beard = page.getByRole('button', { name: /Beard & shave Beard sculpting/ });
    await expect(haircut).toHaveAttribute('aria-pressed', 'true');
    await haircut.click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('at least one service');
    await haircut.click();
    await beard.click();
    await expect(haircut).toHaveAttribute('aria-pressed', 'true');
    await expect(beard).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('status')).toContainText('2 services selected');
    await expect(page.getByRole('status')).toContainText('75 min total');
    await beard.click();
    await expect(page.getByRole('status')).toContainText('45 min total');
    await beard.click();
    const accessibility = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await page.screenshot({
      path: `audit/screenshots/multiple-services-${width}.png`,
      fullPage: true,
    });
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: 'Back', exact: true }).click();
    await expect(beard).toHaveAttribute('aria-pressed', 'true');
    await expect(haircut).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: /Barber A Hair & styling/ }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByRole('button', { name: /^Friday,? 6 November 2026$/ }).click();
    await expect(page.getByRole('button', { name: '11:00 PM', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: '10:45 PM', exact: true })).toBeEnabled();
    await page.getByRole('button', { name: '4:00 PM', exact: true }).click();
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    await page.getByLabel('Your name').fill('Multi Service Demo');
    await page.getByLabel('Phone number').fill('0300 0000000');
    await page.getByRole('button', { name: 'Continue', exact: true }).click();
    const review = page.locator('.review-panel');
    await expect(review).toContainText('Signature haircut');
    await expect(review).toContainText('Beard sculpting');
    await expect(review).toContainText('75 minutes total');
    await expect(review).toContainText('4:00 PM–5:15 PM');
    await page.getByRole('button', { name: 'Confirm demo booking', exact: true }).click();
    await expect(page.locator('.confirmation-card')).toContainText('75 minutes total');
    await page.getByRole('link', { name: 'Owner Demo' }).click();
    await page.getByLabel('Date', { exact: true }).fill('2026-11-06');
    const row = page.getByRole('row').filter({ hasText: 'Multi Service Demo' });
    await expect(row).toContainText('Signature haircut + Beard sculpting');
    await expect(row).toContainText('75 min');
    await page.reload();
    await page.getByLabel('Date', { exact: true }).fill('2026-11-06');
    await expect(row).toContainText('75 min');
    await page.getByRole('button', { name: 'Multi Service Demo', exact: true }).click();
    await page.getByRole('button', { name: 'Reschedule', exact: true }).click();
    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('button', { name: /Beard & shave Beard sculpting/ }),
    ).toHaveAttribute('aria-pressed', 'true');
    await dialog.getByRole('button', { name: /Spa & care Facial care/ }).click();
    await expect(dialog.getByRole('status')).toContainText('135 min total');
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(dialog.getByRole('alert')).toContainText('choose another time');
    await dialog.getByRole('button', { name: '4:00 PM', exact: true }).click();
    await page.getByRole('button', { name: 'Save changes', exact: true }).click();
    await expect(row).toContainText('135 min');
    await expect(row).toContainText('Facial care');
    await page.getByRole('button', { name: 'Multi Service Demo', exact: true }).click();
    await expect(page.getByRole('dialog')).toContainText('4:00 PM–6:15 PM');
    await page.getByRole('button', { name: 'Cancel appointment', exact: true }).click();
    await page.getByRole('button', { name: 'Yes, cancel appointment', exact: true }).click();
    await expect(row).toContainText('Cancelled');
    await page.getByRole('button', { name: 'Add walk-in', exact: true }).click();
    await page.getByLabel('Your name').fill('Multi Walk-in Demo');
    await page.getByLabel('Phone number').fill('0300 0000000');
    await page.getByRole('button', { name: 'Next: appointment time' }).click();
    await dialog.getByRole('button', { name: /Beard & shave Beard sculpting/ }).click();
    await page.getByLabel('Barber', { exact: true }).last().selectOption('barber-a');
    await dialog.getByRole('button', { name: /^Friday,? 6 November 2026$/ }).click();
    await dialog.getByRole('button', { name: '4:00 PM', exact: true }).click();
    await dialog.getByRole('button', { name: 'Add walk-in', exact: true }).click();
    await expect(page.getByRole('row').filter({ hasText: 'Multi Walk-in Demo' })).toContainText(
      '75 min',
    );
    const saved = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('groom-glam-appointments-v1')!).find(
        (a: { name: string }) => a.name === 'Multi Walk-in Demo',
      ),
    );
    expect(saved.serviceIds).toEqual(['haircut', 'beard']);
  });
}

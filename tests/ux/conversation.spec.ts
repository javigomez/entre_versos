import { expect, test, type Page } from '@playwright/test';

// A bottom-following scroll implementation must fail this test even when
// the text and the session engine are otherwise correct.
async function continueButton(page: Page) {
  return page.getByRole('button', { name: 'Continuar', exact: false });
}

test('R01 / UX-001.2–6: Continuar becomes a reply anchored below the header', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /Maestro, estoy listo/ }).tap();
  await (await continueButton(page)).tap();
  const reply = page.getByText('Si vas a hacerme entrenar,\nempieza: quiero probar.', { exact: true });
  await expect(reply).toBeVisible();
  await expect(page.getByText('«No empezarás peleando,\nprimero aprende el oficio;\nyo te seguiré entrenando,\nverso a verso, ejercicio.»', { exact: true })).toBeVisible();
  const header = page.getByRole('button', { name: 'Volver', exact: true });
  // Current header has 24px bottom padding and chat has 10px top margin.
  // Check the actual player bubble, not merely text presence after reload.
  await expect.poll(async () => {
    const h = await header.boundingBox();
    const r = await reply.boundingBox();
    return r!.y - (h!.y + h!.height + 24 + 10 + 12);
  }).toBeGreaterThanOrEqual(-3);
  await expect.poll(async () => {
    const h = await header.boundingBox();
    const r = await reply.boundingBox();
    return Math.abs(r!.y - (h!.y + h!.height + 24 + 10 + 12));
  }).toBeLessThanOrEqual(3);
  await expect(reply).toHaveCount(1);
  await expect(await continueButton(page)).toHaveCount(1);
});

async function firstChallenge(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('batalla-de-gallos:progress:v1', JSON.stringify({
      sessionId: 'primera-batalla-v1', started: true, completed: [], history: [],
    }));
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Abundante', exact: true })).toBeVisible();
}

test('R02: selecting an answer paints it and feedback without reloading', async ({ page }) => {
  await firstChallenge(page);
  await page.getByRole('button', { name: 'Abundante', exact: true }).tap();
  await expect(page.getByText('Abundante', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Abundante: golpe certero,\nya respondes como quiero.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Agitado', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abundante', exact: true })).toHaveCount(0);
});

test('R03 / R09: retry restores four choices and history contains only replies', async ({ page }) => {
  await firstChallenge(page);
  await page.getByRole('button', { name: 'Suficiente', exact: true }).tap();
  await expect(page.getByText('Esa ronda por el barrio,\npero no es su adversario.', { exact: true })).toBeVisible();
  for (const name of ['Abundante', 'Suficiente', 'Completo', 'Variado']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveCount(1);
  }
  await page.getByRole('button', { name: 'Abundante', exact: true }).tap();
  await expect(page.getByRole('button', { name: 'Agitado', exact: true })).toBeVisible();
  await expect(page.getByText('Suficiente', { exact: true })).toHaveCount(1);
  await expect(page.getByText('Abundante', { exact: true })).toHaveCount(1);
  for (const name of ['Abundante', 'Suficiente', 'Completo', 'Variado']) {
    await expect(page.getByRole('button', { name, exact: true })).toHaveCount(0);
  }
});

test('R07: two rapid taps create one answer and one attempt', async ({ page }) => {
  await firstChallenge(page);
  const option = page.getByRole('button', { name: 'Abundante', exact: true });
  await option.scrollIntoViewIfNeeded();
  const box = (await option.boundingBox())!;
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page.getByRole('button', { name: 'Agitado', exact: true })).toBeVisible();
  await expect(page.getByText('Abundante', { exact: true })).toHaveCount(1);
  await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('batalla-de-gallos:progress:v1')!).history.length)).toBe(1);
});

test('R08: reduced motion never skips a player turn', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.getByRole('button', { name: /Maestro, estoy listo/ }).tap();
  await (await continueButton(page)).tap();
  await expect(page.getByText('Si vas a hacerme entrenar,\nempieza: quiero probar.', { exact: true })).toHaveCount(1);
  await expect(await continueButton(page)).toHaveCount(1);
  await expect(page.getByText('Me guardo el gallo bravío;\nhoy entreno el desafío.', { exact: true })).toHaveCount(0);
});

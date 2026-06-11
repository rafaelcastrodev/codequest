import { test, expect, type Page } from '@playwright/test';

const SETTINGS_SEED = JSON.stringify({
  state: { onboardingCompleted: true, soundEnabled: false },
  version: 0,
});

async function seedAndGo(page: Page, path: string) {
  await page.goto('/');
  await page.evaluate((settings) => {
    localStorage.setItem('codequest-settings', settings);
  }, SETTINGS_SEED);
  await page.goto(path);
}

async function clickNext(page: Page) {
  await page.getByRole('button', { name: 'Próximo', exact: true }).click();
}

test.describe('Module 01 — Engagement Techniques', () => {

  test.describe('Lesson 01-01: O que é uma variável?', () => {
    test.beforeEach(async ({ page }) => {
      await seedAndGo(page, '/lesson/01-variaveis/01-01');
      await page.waitForSelector('[aria-label="Passo 1"]');
    });

    test('step 1 shows narrative banner', async ({ page }) => {
      await expect(page.getByText('Tudo começa com uma pergunta')).toBeVisible();
    });

    test('step 2 shows anatomy block with segment labels', async ({ page }) => {
      await clickNext(page);
      await expect(page.getByText('cria a variável')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText('nome da gaveta')).toBeVisible({ timeout: 10_000 });
    });

    test('step 3 shows fill-blank micro-challenge', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      await expect(page.getByText('Complete o código')).toBeVisible();
      const blanks = page.locator('input[placeholder="..."]');
      await expect(blanks).toHaveCount(2);
    });

    test('fill-blank validates correct answers', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      const blanks = page.locator('input[placeholder="..."]');
      await blanks.nth(0).fill('let');
      await blanks.nth(1).fill('number');
      await page.locator('button', { hasText: 'Conferir' }).click();
      await expect(page.getByText('Perfeito!')).toBeVisible();
    });

    test('step 4 shows predict block with choices', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      await clickNext(page);
      await expect(page.getByText('Depois de trocar o valor')).toBeVisible();
      await expect(page.locator('button', { hasText: 'MegaQuest' })).toBeVisible();
    });

    test('predict gives correct feedback on right answer', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      await clickNext(page);
      await page.locator('button', { hasText: 'MegaQuest' }).click();
      await page.locator('button', { hasText: 'Conferir' }).click();
      await expect(page.getByText('Isso mesmo!')).toBeVisible();
    });

    test('predict gives wrong feedback on incorrect answer', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      await clickNext(page);
      await page.locator('button', { hasText: 'CodeQuest' }).click();
      await page.locator('button', { hasText: 'Conferir' }).click();
      await expect(page.getByText('Não era essa!')).toBeVisible();
    });
  });

  test.describe('Lesson 01-02: let vs const', () => {
    test.beforeEach(async ({ page }) => {
      await seedAndGo(page, '/lesson/01-variaveis/01-02');
      await page.waitForSelector('[aria-label="Passo 1"]');
    });

    test('step 2 shows match-pairs micro-challenge', async ({ page }) => {
      await clickNext(page);
      await expect(page.getByText('Conecte cada palavra-chave')).toBeVisible();
      await expect(page.locator('button', { hasText: 'let' })).toBeVisible();
      await expect(page.locator('button', { hasText: 'const' })).toBeVisible();
    });

    test('step 3 shows predict block for const PI', async ({ page }) => {
      await clickNext(page);
      await clickNext(page);
      await expect(page.getByText('O que console.log(PI) vai imprimir?')).toBeVisible();
      await expect(page.locator('button', { hasText: '3.14159' })).toBeVisible();
    });

    test('step 5 shows fill-blank micro-challenge', async ({ page }) => {
      for (let i = 0; i < 4; i++) await clickNext(page);
      await expect(page.getByText('O valor de PI nunca muda')).toBeVisible();
      await expect(page.locator('input[placeholder="..."]')).toHaveCount(1);
    });
  });

  test.describe('Lesson 01-03: Nomeando variáveis', () => {
    test.beforeEach(async ({ page }) => {
      await seedAndGo(page, '/lesson/01-variaveis/01-03');
      await page.waitForSelector('[aria-label="Passo 1"]');
    });

    test('step 2 shows order-steps micro-challenge', async ({ page }) => {
      await clickNext(page);
      await expect(page.getByText('Monte o nome em camelCase')).toBeVisible();
    });

    test('order-steps validates correct order', async ({ page }) => {
      await clickNext(page);
      await page.locator('button', { hasText: 'pontos' }).click();
      await page.locator('button', { hasText: 'De' }).click();
      await page.locator('button', { hasText: 'Vida' }).click();
      await page.locator('button', { hasText: 'Conferir' }).click();
      await expect(page.getByText('Perfeito!')).toBeVisible();
    });

    test('step 4 shows match-pairs for variable naming', async ({ page }) => {
      for (let i = 0; i < 3; i++) await clickNext(page);
      await expect(page.getByText('Classifique cada nome')).toBeVisible();
      await expect(page.locator('button', { hasText: 'pontosDeVida' })).toBeVisible();
    });
  });

  test.describe('Exercise 01-06: Variable Inspector', () => {
    test('shows variable inspector after running code', async ({ page }) => {
      await seedAndGo(page, '/exercise/01-variaveis/01-06');
      await page.waitForSelector('.monaco-editor', { timeout: 15_000 });
      await page.waitForTimeout(1000);
      await page.locator('button', { hasText: 'Executar' }).click();
      await expect(page.locator('p.uppercase', { hasText: 'Variáveis' })).toBeVisible({ timeout: 15_000 });
    });
  });
});

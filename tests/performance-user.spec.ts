import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../data/users';

test.describe('performance_glitch_user', () => {

  test('TC-PFM-01: login should complete without significant delay @regression', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const startTime = Date.now();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);
    await page.waitForURL(/inventory\.html/);
    const elapsedMs = Date.now() - startTime;

    // "Reasonable" defined as under 2 seconds — correct expected — known defect (~5s actual)
    expect(elapsedMs).toBeLessThan(2000);
  });

  test('TC-PFM-04: checkout should complete successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);

    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="checkout"]').click();
    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();
    await checkoutPage.finish();

    // Extended timeout — this account is genuinely slow; give it real time before judging
    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!', { timeout: 10000 });
  });

  test('TC-PFM-11: all products should display correct images, names, and prices', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);

    const inventoryPage = new InventoryPage(page);
    const productNames = page.locator('[data-test="inventory-item-name"]');

    await expect(productNames).toHaveCount(6, { timeout: 10000 });
  });

  test('TC-PFM-12: product can be added to the cart', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.performanceGlitch.username, users.performanceGlitch.password);

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();

    await expect(inventoryPage.cartLink).toHaveText('1', { timeout: 10000 });
  });

});
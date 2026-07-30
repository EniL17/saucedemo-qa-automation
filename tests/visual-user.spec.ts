import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';

test.describe('visual_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.visual.username, users.visual.password);
  });

  test('TC-VIS-10: sorting should reorder correctly for each option', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const firstItem = page.locator('[data-test="inventory-item-name"]').first();
    const firstPrice = page.locator('[data-test="inventory-item-price"]').first();

    await inventoryPage.sortBy('az');
    await expect(firstItem).toHaveText('Sauce Labs Backpack'); // correct expected — known defect

    await inventoryPage.sortBy('za');
    await expect(firstItem).toHaveText('Test.allTheThings() T-Shirt (Red)'); // correct expected — known defect

    await inventoryPage.sortBy('lohi');
    await expect(firstPrice).toHaveText('$7.99'); // correct expected — known defect

    await inventoryPage.sortBy('hilo');
    await expect(firstPrice).toHaveText('$49.99'); // correct expected — known defect
  });

  test('TC-VIS-11: product prices should stay consistent across page refreshes', async ({ page }) => {
    const priceLocator = page.locator('[data-test="inventory-item-price"]').first();

    const priceBefore = await priceLocator.textContent();
    await page.reload();
    const priceAfter = await priceLocator.textContent();

    expect(priceAfter).toBe(priceBefore); // correct expected — known defect (prices randomize on reload)
  });

  test('TC-VIS-12: inventory page and detail page should show the same price', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const inventoryPrice = page.locator('[data-test="inventory-item-price"]').first();

    const priceOnInventory = await inventoryPrice.textContent();

    await inventoryPage.firstProductTitleLink().click();
    const detailPrice = page.locator('[data-test="inventory-item-price"]');
    const priceOnDetail = await detailPrice.textContent();

    // Same product, same moment — should show the same price everywhere
    expect(priceOnDetail).toBe(priceOnInventory); // correct expected — known defect
  });

  test('TC-VIS-13: product can be added to and removed from cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await expect(inventoryPage.cartLink).toHaveText('1'); // expected to pass — no bug here

    await inventoryPage.removeFromCart('sauce-labs-backpack').click();
    await expect(inventoryPage.cartLink).toHaveText(''); // expected to pass — no bug here
  });

});
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';

test.describe('Inventory - standard_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('TC-STD-07: sort by Name (A to Z)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('az');

    const firstItem = page.locator('[data-test="inventory-item-name"]').first();
    await expect(firstItem).toHaveText('Sauce Labs Backpack');
  });

  test('TC-STD-08: sort by Name (Z to A)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('za');

    const firstItem = page.locator('[data-test="inventory-item-name"]').first();
    await expect(firstItem).toHaveText('Test.allTheThings() T-Shirt (Red)');
  });

  test('TC-STD-09: sort by Price (low to high)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('lohi');

    const firstPrice = page.locator('[data-test="inventory-item-price"]').first();
    await expect(firstPrice).toHaveText('$7.99');
  });

  test('TC-STD-10: sort by Price (high to low)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.sortBy('hilo');

    const firstPrice = page.locator('[data-test="inventory-item-price"]').first();
    await expect(firstPrice).toHaveText('$49.99');
  });

  test('TC-STD-11: add product to cart from catalog view @smoke', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();

    await expect(inventoryPage.cartLink).toHaveText('1');
  });

  test('TC-STD-06: clicking a product title opens its detail page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.firstProductTitleLink().click();

    await expect(page).toHaveURL(/inventory-item\.html\?id=\d+/);
  });

});
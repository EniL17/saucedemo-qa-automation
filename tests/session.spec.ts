import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { users } from '../data/users';

test.describe.configure({ retries: 2 });

test.describe('Session & Menu - standard_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

test('TC-STD-16: logout ends session and blocks back-navigation', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.openMenu();

    // Confirm the menu genuinely opened before looking for logout specifically
    await inventoryPage.resetAppStateLink.waitFor({ state: 'visible', timeout: 15000 });

   await inventoryPage.logoutLink.click();

    await expect(page).toHaveURL('https://www.saucedemo.com/');

    await page.goBack();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  test('TC-STD-18: Reset App State should revert Remove button to Add to cart @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.resetAppState();

    await expect(inventoryPage.cartLink).toHaveText(''); // this part works correctly
    await expect(page.locator('[data-test="add-to-cart-sauce-labs-backpack"]')).toBeVisible(); // this part is the bug — currently fails
  });

});
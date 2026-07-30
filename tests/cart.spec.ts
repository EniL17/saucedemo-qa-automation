import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { users } from '../data/users';

test.describe('Cart - standard_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);
  });

  test('TC-STD-12: remove product from cart via catalog view', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await expect(inventoryPage.cartLink).toHaveText('1');

    await inventoryPage.removeFromCart('sauce-labs-backpack').click();
    await expect(inventoryPage.cartLink).toHaveText(''); // badge disappears entirely when cart is empty
  });

  test('TC-STD-13: remove product from cart page @smoke', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();

    await cartPage.removeFromCart('sauce-labs-backpack').click();
    await expect(inventoryPage.cartLink).toHaveText('');
  });

  test('TC-STD-13b: cart shows exactly the items added', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.addToCart('sauce-labs-bike-light').click();
    await inventoryPage.goToCart();

    const cartItems = page.locator('[data-test="inventory-item-name"]');
    await expect(cartItems).toHaveCount(2);
  });

  test('support Test-Case: Continue Shopping returns to inventory without changing cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);

    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await cartPage.continueShopping();

    await expect(page).toHaveURL(/inventory.html/);
    await expect(inventoryPage.cartLink).toHaveText('1'); // unchanged
  });

});
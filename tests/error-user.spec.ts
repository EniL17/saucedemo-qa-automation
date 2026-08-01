import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../data/users';
import { allProductSlugs } from '../data/products';

test.describe('error_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.error.username, users.error.password);
  });

  test('TC-ERR-02: sorting should reorder without errors @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);

    let dialogMessage = '';
    page.once('dialog', async (dialog) => {
      dialogMessage = dialog.message();
      await dialog.dismiss();
    });

    await inventoryPage.sortBy('za');
    await page.waitForTimeout(500); // brief pause to let the dialog event fire before we check it

    expect(dialogMessage).toBe(''); // correct expected — no alert should appear; currently fails, known defect
  });

  test('TC-ERR-03: all 6 products should be addable to cart @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    for (const slug of allProductSlugs) {
      await inventoryPage.addToCart(slug).click();
    }

    await expect(inventoryPage.cartLink).toHaveText('6'); // correct expected — known defect
  });

  test('TC-ERR-06: all three checkout fields should accept text input @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo('Anil', 'Biju', '44135');

    await expect(checkoutPage.lastNameInput).toHaveValue('Biju'); // correct expected — known defect
  });

  test('TC-ERR-07: checkout should proceed to overview with valid data', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await cartPage.checkout();

    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(/checkout-step-two\.html/); // expected to pass — no bug here
  });

  test('TC-ERR-08: Finish should complete the order @regression', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await cartPage.checkout();
    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();
    await checkoutPage.finish();

    await expect(page).toHaveURL(/checkout-complete\.html/); // correct expected — known defect
  });

});
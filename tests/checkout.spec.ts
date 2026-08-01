import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../data/users';

test.describe('Checkout - standard_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
  });

  test('TC-STD-14: complete checkout happy path @smoke', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();
    await checkoutPage.finish();

    await expect(page.locator('.complete-header')).toHaveText('Thank you for your order!');
  });

  test('TC-STD-22: blocked when First Name is missing', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('', 'Biju', '44135');
    await checkoutPage.continueCheckout();

    const error = checkoutPage.getValidationError('First Name is required');
    await expect(error).toBeVisible();
  });

  test('TC-STD-22: blocked when Last Name is missing', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('Anil', '', '44135');
    await checkoutPage.continueCheckout();

    const error = checkoutPage.getValidationError('Last Name is required');
    await expect(error).toBeVisible();
  });

  test('TC-STD-22: blocked when Postal Code is missing', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('Anil', 'Biju', '');
    await checkoutPage.continueCheckout();

    const error = checkoutPage.getValidationError('Postal Code is required');
    await expect(error).toBeVisible();
  });

  test('TC-STD-21: checkout fields should validate input format @regression', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('an1l!@#', 'x_9$', '4444444-.@');
    await checkoutPage.continueCheckout();

    // Correct expected behaviour: invalid format should be rejected
    const error = checkoutPage.getValidationError('valid');
    await expect(error).toBeVisible(); // currently fails — no validation exists, so no error appears
  });

  test('TC-STD-15: PDF receipt can be generated after checkout', async ({ page }) => {
    const cartPage = new CartPage(page);
    const checkoutPage = new CheckoutPage(page);

    await cartPage.checkout();
    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();
    await checkoutPage.finish();

    const downloadPromise = page.waitForEvent('download');
    await checkoutPage.generatePdfButton.click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toContain('.pdf'); // expected to pass — real, working feature
  });

});
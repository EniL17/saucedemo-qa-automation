import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { InventoryPage } from '../pages/InventoryPage';
import { CheckoutPage } from '../pages/CheckoutPage';
import { users } from '../data/users';

test.describe('problem_user', () => {

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.problem.username, users.problem.password);
  });

  test('TC-PRB-03: all 6 products should be addable to cart', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const productSlugs = [
      'sauce-labs-backpack', 'sauce-labs-bike-light', 'sauce-labs-bolt-t-shirt',
      'sauce-labs-fleece-jacket', 'sauce-labs-onesie', 'test.allthethings()-t-shirt-(red)',
    ];
    for (const slug of productSlugs) {
      await inventoryPage.addToCart(slug).click();
    }

    await expect(inventoryPage.cartLink).toHaveText('6'); // correct expected — currently fails, known defect
  });

  test('TC-PRB-04: Remove should clear the item from the cart (catalog view)', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.removeFromCart('sauce-labs-backpack').click();

    await expect(inventoryPage.cartLink).toHaveText(''); // correct expected — currently fails, known defect
  });

  test('TC-PRB-05: Remove works correctly from the cart page', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

    await expect(inventoryPage.cartLink).toHaveText(''); // expected to pass — no bug here
  });

  test('TC-PRB-06: sorting should reorder the product list', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const firstItem = page.locator('[data-test="inventory-item-name"]').first();

    const nameBeforeSort = await firstItem.textContent();
    await inventoryPage.sortBy('za');
    const nameAfterSort = await firstItem.textContent();

    expect(nameAfterSort).not.toBe(nameBeforeSort); // correct expected — currently fails, known defect
  });

  test('TC-PRB-07: First Name field accepts text normally', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="checkout"]').click();

    await checkoutPage.firstNameInput.fill('Anil');
    await expect(checkoutPage.firstNameInput).toHaveValue('Anil'); // expected to pass — no bug here
  });

  test('TC-PRB-08: First Name field should retain its value after Last Name is typed', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="checkout"]').click();

    await checkoutPage.firstNameInput.fill('Anil');
    await checkoutPage.lastNameInput.fill('Biju');

    await expect(checkoutPage.firstNameInput).toHaveValue('Anil'); // correct expected — currently fails, known defect
  });

  test('TC-PRB-09: Postal Code field accepts text normally', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="checkout"]').click();

    await checkoutPage.postalCodeInput.fill('44135');
    await expect(checkoutPage.postalCodeInput).toHaveValue('44135'); // expected to pass — no bug here
  });

  test('TC-PRB-10: checkout should proceed to overview with valid data', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    const checkoutPage = new CheckoutPage(page);
    await inventoryPage.addToCart('sauce-labs-backpack').click();
    await inventoryPage.goToCart();
    await page.locator('[data-test="checkout"]').click();

    await checkoutPage.fillInfo('Anil', 'Biju', '44135');
    await checkoutPage.continueCheckout();

    await expect(page).toHaveURL(/checkout-step-two\.html/); // correct expected — currently fails, known defect
  });

  test('TC-PRB-11: logout works normally', async ({ page }) => {
    const inventoryPage = new InventoryPage(page);
    await inventoryPage.openMenu();
    await page.locator('[data-test="logout-sidebar-link"]').click();

    await expect(page).toHaveURL('https://www.saucedemo.com/'); // expected to pass — no bug here
  });

});
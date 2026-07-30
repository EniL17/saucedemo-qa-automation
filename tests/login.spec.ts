import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { users } from '../data/users';

test.describe('Login - standard_user', () => {

  test('TC-STD-01: valid login redirects to inventory page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, users.standard.password);

    await expect(page).toHaveURL(/inventory.html/);
  });

  test('TC-STD-02: invalid password shows error and blocks login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, 'wrong_password');

    await expect(page).toHaveURL('https://www.saucedemo.com/');
    await expect(loginPage.errorMessage).toContainText('do not match');
  });

  test('TC-STD-03: empty username shows required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('', users.standard.password);

    await expect(loginPage.errorMessage).toContainText('Username is required');
  });

  test('TC-STD-04: empty password shows required error', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(users.standard.username, '');

    await expect(loginPage.errorMessage).toContainText('Password is required');
  });

});
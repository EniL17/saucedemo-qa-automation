import { Page, Locator } from '@playwright/test';

export class InventoryPage {
  readonly page: Page;
  readonly sortDropdown: Locator;
  readonly cartLink: Locator;
  readonly menuButton: Locator;
  readonly resetAppStateLink: Locator;
  readonly aboutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartLink = page.locator('[data-test="shopping-cart-link"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.resetAppStateLink = page.locator('[data-test="reset-sidebar-link"]');
    this.aboutLink = page.locator('[data-test="about-sidebar-link"]');
  }

  // Dynamic selectors — one method handles ALL 6 products, instead of writing 6 separate ones.
  addToCart(productSlug: string): Locator {
    return this.page.locator(`[data-test="add-to-cart-${productSlug}"]`);
  }

  removeFromCart(productSlug: string): Locator {
    return this.page.locator(`[data-test="remove-${productSlug}"]`);
  }

  // The actual clickable title link for a product, by its position (0 = first product).
  // Verified via codegen: SauceDemo uses item-{index}-title-link, not the description text.
  productTitleLink(index: number): Locator {
    return this.page.locator(`[data-test="item-${index}-title-link"]`);
  }

  firstProductTitleLink(): Locator {
    return this.productTitleLink(0);
  }

  async sortBy(option: 'az' | 'za' | 'lohi' | 'hilo') {
    await this.sortDropdown.selectOption(option);
  }

  async openMenu() {
    await this.menuButton.click();
  }

  async resetAppState() {
    await this.openMenu();
    await this.resetAppStateLink.click();
  }

  async goToCart() {
    await this.cartLink.click();
  }
}
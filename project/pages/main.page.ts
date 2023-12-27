import { Locator, Page, expect } from "@playwright/test";
import { BasketModalPage } from "./basketModal.page";

export class MainPage {
    private page: Page;    
    private basketButtonLocator: Locator;
    private basketCountBadgeLocator: Locator;
    private discountCheckBoxLocator: Locator;
    private basketModalContainer: Locator;    

    public constructor(page: Page) {
      this.page = page;
      this.basketButtonLocator = page.locator(`//i[contains(@class, 'basket_icon')]`);
      this.basketCountBadgeLocator = page.locator(`//span[contains(@class, 'basket-count-items')]`);      
      this.discountCheckBoxLocator = page.locator(`//input[contains(@class, 'actionSearchFilter')]`);
      this.basketModalContainer = page.locator(`//div[contains(@class, 'dropdown-menu') and contains(@class, 'show')]`);
    }

    async getBasketCount(): Promise<number> {
      return Number(await this.basketCountBadgeLocator.textContent());
    }

    async openBasketModal(): Promise<void> {
      await this.basketButtonLocator.click();
    }

    async cleanBasket(): Promise<void> {
      const basketModal = new BasketModalPage(this.page);
      await this.openBasketModal();
      await basketModal.cleanBasket();
    }

    async enableOnlyDiscountGoods(): Promise<void> {
      const requestPromise = this.page.waitForRequest(request =>
        request.url() === 'https://enotes.pointschool.ru/product/get' 
        && request.method() === 'POST'
        && request.postData() === `filters=search%3D%26price-from%3D%26price-to%3D%26is-discount%3Don&action=discount&page=1`        
      );
      await this.discountCheckBoxLocator.check();      
      await requestPromise;
    }

    async isBasketModalOpen(): Promise<void> {
      await expect(this.basketModalContainer).toBeVisible();
    }

    async checkBasketItemsAmoutn(expectedAmount: number): Promise<void> {
      expect(await this.getBasketCount()).toEqual(expectedAmount);
    }        
}
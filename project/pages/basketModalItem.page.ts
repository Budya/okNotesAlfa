import { Locator, Page, expect } from "@playwright/test";
import { removeMinusFromString } from "../utils/removeMinusFromString.util";


export class BasketModalProductPage {
    private page: Page;
    private moveFromBasketIconLocator: Locator;
    private productNameLocator: Locator;
    private productTotalPriceLocator: Locator;    
    private productQuantityLocator: Locator;


    public constructor(page: Page, locator: Locator) {
      this.page = page;
      this.moveFromBasketIconLocator = locator.locator(`//i[contains(@class, 'actionDeleteProduct')]`);
      this.productNameLocator = locator.locator(`span.basket-item-title`);
      // this.productTotalPriceLocator = locator.getByText(/р.$/);      
      this.productTotalPriceLocator = locator.locator(`span[class='basket-item-price']`);      
      this.productQuantityLocator = locator.locator(`span[class^='basket-item-count']`);
    }

    async moveFromBasket(): Promise<void> {
      const basketUpdate = this.page.waitForResponse(`https://enotes.pointschool.ru/basket/get`);
      await this.moveFromBasketIconLocator.click();
      await basketUpdate;
    }

    async getName(): Promise<string> {
      const productName = await this.productNameLocator.textContent();
      return productName ? productName : `No product name provided`;      
    }

    async getTotalPrice(): Promise<number> | never {
      const productTotalPrice = await this.productTotalPriceLocator.textContent();

      if(productTotalPrice !== null 
        && !Number.isNaN(Number.parseInt(removeMinusFromString(productTotalPrice)))
      ) {
        return Number.parseInt(removeMinusFromString(productTotalPrice));
      } else {
        throw new Error(`Wrong product price value`);
      }
    }

    async getQuantity(): Promise<number> | never {
      const quantity = await this.productQuantityLocator.textContent();

      if(quantity !== null 
        && !Number.isNaN(Number.parseInt(quantity))
      ) {
        return Number.parseInt(quantity);
      } else {
        throw new Error(`Wrong product quantity value`);
      }
    }

    async isProductNameVisible(): Promise<void> {
      await expect(this.productNameLocator).toBeVisible();
    }

    async isProductTotalPriceVisible(): Promise<void> {
      await expect(this.productTotalPriceLocator).toBeVisible();
    }

    async isProductQuantityVisible(): Promise<void> {
      await expect(this.productQuantityLocator).toBeVisible();
    }

    async checkItemElementsVisibility(): Promise<void> {
      await this.isProductNameVisible();
      await this.isProductTotalPriceVisible();
      await this.isProductQuantityVisible();
    }

} 
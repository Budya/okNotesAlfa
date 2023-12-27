import { Locator, Page, expect } from "@playwright/test";
import { BasketStorage } from "../utils/storage/storage";
import { Item } from "../utils/storage/basketItem";


export class ProductPage {
    private page: Page;
    private productNameLocator: Locator;
    private productPriceLocator: Locator;
    private productNeedAmountInputLocator: Locator;
    private availableAmountLocator: Locator;
    private addToBasketButtonLocator: Locator;
    private discountSpanLocator: Locator;


    public constructor(page: Page, locator: Locator) {
      this.page = page;
      this.productNameLocator = locator.locator(`//div[contains(@class, 'product_name')]`);
      this.productPriceLocator = locator.locator(`//span[contains(@class, 'product_price')]`);
      this.productNeedAmountInputLocator = locator.locator(`//input[@name='product-enter-count']`);
      this.availableAmountLocator = locator.locator(`//span[contains(@class, 'product_count')]`);
      this.addToBasketButtonLocator = locator.locator(`//button[contains(@class, 'actionBuyProduct')]`);
      this.discountSpanLocator = locator.locator(`//s`);
    }

    async getName(): Promise<string> {
      const productName = await this.productNameLocator.textContent();
      return productName ? productName : `No product name provided`;      
    }

    async setNeedAmount(amount: number): Promise<void> {
      await this.productNeedAmountInputLocator.fill(amount.toString());
      await expect(this.productNeedAmountInputLocator).toHaveValue(amount.toString());
    }

    async getAvailableAmountValue(): Promise<number> | never {
      const available = await this.availableAmountLocator.textContent();
      if(available !== null && !Number.isNaN(Number.parseInt(available))) {
        return Number.parseInt(available);
      } else {
        throw new Error(`No product available provided`);
      }
    }

    async getPrice(): Promise<number> | never {
      const productPrice = await this.productPriceLocator.textContent();
      if(productPrice !== null && !Number.isNaN(Number.parseInt(productPrice))) {
        return Number.parseInt(productPrice);
      } else {
        throw new Error(`No product price provided`);
      }
    }

    async addToBasket(): Promise<void> {
      const basketUpdate = this.page.waitForResponse(`https://enotes.pointschool.ru/basket/get`);
      await this.addToBasketButtonLocator.click();

      const storage = BasketStorage.getStorage().getBasket();
      const name = await this.getName();
      const itemPrice = await this.getPrice();
      const quantity = Number(await this.productNeedAmountInputLocator.inputValue());
      const item: Item = new Item(name, itemPrice, quantity)
      storage.addItem(item);

      await basketUpdate;
    }

    async isHasDiscount(): Promise<boolean> {
      return !!await this.discountSpanLocator.count()
    }
} 
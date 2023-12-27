import { Locator, Page, expect } from "@playwright/test";
import { BasketModalProductPage } from "./basketModalItem.page";

export class BasketModalPage {
    private page: Page;   
    private basketItemsContainerLocator: Locator;     
    private basketProductLocator: Locator;     
    private basketPriceLocator: Locator;
    private goToBasketPageButtonLocator: Locator;
    private cleanBasketButtonLocator: Locator;

    public constructor(page: Page) {
      this.page = page;
      this.basketItemsContainerLocator =  this.page.locator(`//ul[contains(@class, 'list-group')]`);
      this.basketProductLocator = this.basketItemsContainerLocator.locator(`li`);
      this.basketPriceLocator = page.locator(`span.basket_price`);
      this.goToBasketPageButtonLocator = page.locator(`//a[contains(@href,'basket')]`);      
      this.cleanBasketButtonLocator = page.locator(`div[class*="actionClearBasket"] > a`);      
    }

    async goToBasketPage(): Promise<void> {
      await this.goToBasketPageButtonLocator.click();
    }

    private async getBasketProductLocators(): Promise<Locator[]> {
      return await this.basketProductLocator.all(); 
    }

    /**
     * @param {number}  positionNumber - zero-based.
    */
    async getBasketItemByPosition(positionNumber: number): Promise<BasketModalProductPage> | never {
      if((await this.getBasketProductLocators()).length > 0) {
        const itemsLocators = await this.getBasketProductLocators();
        return new BasketModalProductPage(this.page, itemsLocators[positionNumber]);
      } else {
        throw new Error(`No items in basket`);
      }      
    }
    
    async checkBasketModalItemsVisibility(): Promise<void> | never {
      if((await this.getBasketProductLocators()).length > 0) {
        const itemsLocators = await this.getBasketProductLocators();        
        for(const locator of itemsLocators) {
          await new BasketModalProductPage(this.page, locator).checkItemElementsVisibility();          
        }
      } else {
        throw new Error(`No any items in basket`);
      }
    }

    async getBasketPrice(): Promise<number> {
      return Number(await this.basketPriceLocator.textContent());
    }
    
    async cleanBasket(): Promise<void> {
      const basketItemsResponsePromise = this.page.waitForResponse('https://enotes.pointschool.ru/basket/get');
      await this.cleanBasketButtonLocator.click();
      await basketItemsResponsePromise;
    } 
    
    async isBasketPriceVisible(): Promise<void> {
      await expect(this.basketPriceLocator).toBeVisible();
    }
}
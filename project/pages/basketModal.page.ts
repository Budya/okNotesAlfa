import { Locator, Page, expect } from "@playwright/test";
import { BasketModalProductPage } from "./basketModalItem.page";
import { Basket } from "../utils/storage/basket";
import { Item } from "../utils/storage/basketItem";
import { BasketStorage } from "../utils/storage/storage";

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
      this.goToBasketPageButtonLocator = page.getByText(/Перейти в корзину/);      
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

    private async getBasketModalProductsData(): Promise<Basket> {
      const basketModalData = new Basket();
      const itemsLocators = await this.getBasketProductLocators();
      for(const itemLocator of itemsLocators) {
        const viewItem = new BasketModalProductPage(this.page, itemLocator);
        const name = await viewItem.getName();
        const itemTotalPrice = await viewItem.getTotalPrice();
        const quantity = await viewItem.getQuantity();
        const basketItem = new Item(name, itemTotalPrice / quantity, quantity);
        basketModalData.addItem(basketItem);
      }
      return basketModalData;
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

    async checkBasketModalItems() {
      const modalBasket = await this.getBasketModalProductsData();
      const storedBasket = BasketStorage.getStorage().getBasket();
      const modalItemsSorted = modalBasket.sortItems();
      const storedItemsSorted = storedBasket.sortItems();

      if(modalItemsSorted.length !== storedItemsSorted.length) {
       expect.soft(modalItemsSorted.length).toEqual(storedItemsSorted.length);
      } else {
        modalItemsSorted.forEach((modalItem, index) => {
          expect.soft(modalItem.getName()).toEqual(storedItemsSorted[index].getName());
          expect.soft(modalItem.getTotalPrice()).toEqual(storedItemsSorted[index].getTotalPrice());
          expect.soft(modalItem.getItemPrice()).toEqual(storedItemsSorted[index].getItemPrice());
          expect.soft(modalItem.getQuantity()).toEqual(storedItemsSorted[index].getQuantity());
        })
      }

      //assert calculated basket price with modal view value
      expect.soft(await this.getBasketPrice()).toEqual(modalBasket.getBasketPrice());

      //assert calculated in storage basket price with modal view value
      expect.soft(await this.getBasketPrice()).toEqual(storedBasket.getBasketPrice());

      //assert calculated baske price with calculated in storage
      expect.soft(modalBasket.getBasketPrice()).toEqual(storedBasket.getBasketPrice());
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
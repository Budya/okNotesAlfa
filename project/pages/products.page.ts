import { Locator, Page } from "@playwright/test";
import { ProductPage } from "./product.page";


export class ProductsPage {
    private page: Page;    
    private productsContainerLocator: Locator;
    private productLocator: Locator;
    private currentPageLocator: Locator;
    private pageLinkLocator: Locator;
    private pageLinkSelector = (pageNumber: number): string => `//a[@data-page-number='${pageNumber}']`;       

    public constructor(page: Page) {
      this.page = page;
      this.productsContainerLocator = this.page.locator(`//div[contains(@class, 'note-list')]`)
      this.productLocator = this.productsContainerLocator.locator(`//div[contains(@class, 'note-item')]`);   
      this.currentPageLocator = this.page.locator(`//li[@class='page-item active']//a[@class='page-link']`);
      this.pageLinkLocator = this.page.locator(`//a[@class='page-link']`);      
    }

    private async getItemsLocators(): Promise<Locator[]> {
      return await this.productLocator.all();      
    }

    private async getOneItemWithDiscount(): Promise<ProductPage> | never {
      let itemWithDiscount: ProductPage | null = null;
      const locators = await this.getItemsLocators();
      for(const itemLocator of locators) {
        const item = new ProductPage(this.page, itemLocator);
        if(await item.isHasDiscount()) {
          itemWithDiscount = item;
          break;
        }
      }
      if(!itemWithDiscount) {
        throw new Error('No any poroducts with discount on page');
      } else {
        return itemWithDiscount;
      }
    }

    private async getOneItemNoDiscount(): Promise<ProductPage> | never {
      let itemNoDiscount: ProductPage | null = null;
      const locators = await this.getItemsLocators();
      for(const itemLocator of locators) {
        const item = new ProductPage(this.page, itemLocator);
        if(!await item.isHasDiscount()) {
          itemNoDiscount = item;
          break;
        }
      }
      if(!itemNoDiscount) {
        throw new Error('No any poroducts without discount on page');
      } else {
        return itemNoDiscount;
      }
    }

    private async getDiscountedItemWithStorage(needItems: number): Promise<ProductPage> | never {
      let itemTarget: ProductPage | null = null;
      const locators = await this.getItemsLocators();
      for(const itemLocator of locators) {
        const item = new ProductPage(this.page, itemLocator);
        if(
          await item.isHasDiscount()
          && await item.getAvailableAmountValue() >= needItems 
        ) {
          itemTarget = item;
          break;
        }
      }

      if(!itemTarget) {
        throw new Error('No any poroducts with necessary quantity on page');
      } else {
        return itemTarget;
      }
    }

    async addNumberOfDiscountedOneTypeItemsInBasket(needItems: number): Promise<void> {
      const discountedItem = await this.getDiscountedItemWithStorage(needItems);
      await discountedItem.setNeedAmount(needItems);
      await discountedItem.addToBasket();
    }

    async getCurrentPage(): Promise<number> | never {
      const currentPageNumber = await this.currentPageLocator.textContent();
      if(currentPageNumber !== null 
        && !Number.isNaN(Number.parseInt(currentPageNumber))
      ) {
        return Number.parseInt(currentPageNumber);
      } else {
        throw new Error(`Wrong page number value`);
      }
    }

    async getPaginationPages(): Promise<number> {
      return (await this.pageLinkLocator.all()).length;
    }

    async goToNextPage(): Promise<ProductsPage> | never {
      const currentPage = await this.getCurrentPage();
      if(await this.getPaginationPages() <= currentPage + 1) {
        const waitForContent = this.page.waitForResponse(`https://enotes.pointschool.ru/product/get`);
        await this.page.locator(this.pageLinkSelector(currentPage + 1)).click();
        await waitForContent;
        return new ProductsPage(this.page);
      } else {
        throw new Error(`Can't go to next page, current page is last`);
      }

    }

    async addNumberOfUnsameTypeItemsInBasket(numberOfItems: number, predefinedItems: Array<string> = []): Promise<void> {
      let itemsLocators = await this.getItemsLocators();
      for(const locator of itemsLocators) {
        if(predefinedItems.length < numberOfItems) {
          const item = new ProductPage(this.page, locator);
          const itemName = await item.getName();
          if(!predefinedItems.includes(itemName)) {
            await item.addToBasket();
            predefinedItems.push(itemName);            
          }
        } else {
          break;
        }
      }
      if(predefinedItems.length < numberOfItems) {
        const nextPage = await this.goToNextPage()
        itemsLocators = await nextPage.getItemsLocators();
        for(const locator of itemsLocators) {
          if(predefinedItems.length < numberOfItems) {
            const item = new ProductPage(this.page, locator);
            const itemName = await item.getName();
            if(!predefinedItems.includes(itemName)) {
              await item.addToBasket();
              predefinedItems.push(itemName);            
            }
          } else {
            break;
          }
        }
      }
    }

    async addNumberOfUnsameTypeItemsNoDiscountTypeInBasket(numberOfItems: number, predefinedItems: Array<string> = []): Promise<void> {
      const itemsLocators = await this.getItemsLocators();
      for(const locator of itemsLocators) {
        if(predefinedItems.length < numberOfItems) {
          const item = new ProductPage(this.page, locator);
          const itemName = await item.getName();
          if(!predefinedItems.includes(itemName) && !await item.isHasDiscount()) {
            await item.addToBasket();
            predefinedItems.push(itemName);            
          }
        } else {
          break;
        }
      }      
    }

    async addFirstItemNoDiscountInBasket(): Promise<void> {
      const basketUpdate = this.page.waitForResponse(`https://enotes.pointschool.ru/basket/get`);
      await (await this.getOneItemNoDiscount()).addToBasket();
      await basketUpdate;
    }

    async addFirstItemWithDiscountInBasket(): Promise<void> {
      const basketUpdate = this.page.waitForResponse(`https://enotes.pointschool.ru/basket/get`);
      await (await this.getOneItemWithDiscount()).addToBasket();
      await basketUpdate;
    }



           
}
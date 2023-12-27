import { Page, expect } from "@playwright/test";

export class BasketPage {
    page: Page;
    url: string = `https://enotes.pointschool.ru/basket`;    

    constructor(page: Page) {
      this.page = page;      
    }

    async isPageOpen(): Promise<void> {
      expect(this.page.url()).toEqual(this.url);
    }
}
import { Locator, Page } from "@playwright/test";
import { getPassword } from "../utils/getPassword.util";

export class LoginPage {
    page: Page;
    url: string = `/login`;
    loginInputLocator: Locator;    
    passwordInputLocator: Locator;
    submitButtonLocator: Locator;

    constructor(page: Page) {
      this.page = page;
      this.loginInputLocator = page.locator(`//input[@id='loginform-username']`);
      this.passwordInputLocator = page.locator(`input#loginform-password`);
      this.submitButtonLocator = page.locator(`//button[@name='login-button']`);
    }

    async goTo(): Promise<void> {
      await this.page.goto(this.url);
    }

    async login(): Promise<void> {
      const basketItemsResponsePromise = this.page.waitForResponse('https://enotes.pointschool.ru/basket/get');
      await this.loginInputLocator.fill('test');
      await this.loginInputLocator.press('Tab');
      // @ts-ignore
      await this.passwordInputLocator.fill(getPassword());
      await this.passwordInputLocator.press('Tab');
      await this.submitButtonLocator.click();
      await basketItemsResponsePromise;
    }
}
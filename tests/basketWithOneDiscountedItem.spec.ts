/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test';
import { LoginPage } from '../project/pages/login.page';
import { MainPage } from '../project/pages/main.page';
import { BasketModalPage } from '../project/pages/basketModal.page';
import { BasketPage } from '../project/pages/basket.page';
import { ProductsPage } from '../project/pages/products.page';

test.describe('Test basket with one product with discount', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login();

    const mainPage = new MainPage(page);
    if(await mainPage.getBasketCount() > 0) {
      await mainPage.cleanBasket();
    }

    const productsPage = new ProductsPage(page);
    await productsPage.addFirstItemWithDiscountInBasket();
  });

  test.afterEach(async ({ context }) => {

    await context.request.post(`http://enotes.pointschool.ru/basket/clear`, 
      {
        headers: {
          'content-type': 'application/json;charset=UTF-8'          
        },        
      }
    );

    await context.close();
  });

  test('Add 8 product items(unsame types) in basket', async ({ page }) => {    
    const productsInBasket: Array<string> = ['Творческий беспорядок'];
    const itemsToAdd: number = 9;   
    
    const productsPage = new ProductsPage(page);    
    await productsPage.addNumberOfUnsameTypeItemsInBasket(itemsToAdd, productsInBasket);
    
    const mainPage = new MainPage(page);
    await mainPage.checkBasketItemsAmoutn(itemsToAdd);

    await mainPage.openBasketModal();
    await mainPage.isBasketModalOpen();
    const basketModal = new BasketModalPage(page);
    await basketModal.checkBasketModalItemsVisibility();

    await basketModal.isBasketPriceVisible();
    await basketModal.goToBasketPage();

    const basketPage = new BasketPage(page);
    await basketPage.isPageOpen();    
  })
});

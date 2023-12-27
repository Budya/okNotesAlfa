/* eslint-disable playwright/expect-expect */
import { test } from '@playwright/test';
import { LoginPage } from '../project/pages/login.page';
import { MainPage } from '../project/pages/main.page';
import { BasketModalPage } from '../project/pages/basketModal.page';
import { BasketPage } from '../project/pages/basket.page';
import { ProductsPage } from '../project/pages/products.page';


test.describe('Test empty basket', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goTo();
    await loginPage.login();

    const mainPage = new MainPage(page);
    if(await mainPage.getBasketCount() > 0) {
      await mainPage.cleanBasket();
    }
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

  test('Open empty basket', async ({ page }) => {    
    const mainPage = new MainPage(page);
    await mainPage.openBasketModal();
    
    await mainPage.isBasketModalOpen();
    const basketModal = new BasketModalPage(page);
    await basketModal.goToBasketPage();
    const basketPage = new BasketPage(page);
    
    await basketPage.isPageOpen();
  })

  test('Add one product item without discount in basket', async ({ page }) => {    
    const productsPage = new ProductsPage(page);    
    await productsPage.addFirstItemNoDiscountInBasket();

    const mainPage = new MainPage(page);
    await mainPage.checkBasketItemsAmoutn(1);

    await mainPage.openBasketModal();
    await mainPage.isBasketModalOpen();
    const basketModal = new BasketModalPage(page);

    const firstBasketItem = await basketModal.getBasketItemByPosition(0);
    await firstBasketItem.checkItemElementsVisibility();    
    await basketModal.isBasketPriceVisible();
    await basketModal.goToBasketPage();

    const basketPage = new BasketPage(page);
    await basketPage.isPageOpen();    
  })

  test('Add one product item with discount in basket', async ({ page }) => {    
    const productsPage = new ProductsPage(page);    
    await productsPage.addFirstItemWithDiscountInBasket();

    const mainPage = new MainPage(page);
    await mainPage.checkBasketItemsAmoutn(1);

    await mainPage.openBasketModal();
    await mainPage.isBasketModalOpen();
    const basketModal = new BasketModalPage(page);

    const firstBasketItem = await basketModal.getBasketItemByPosition(0);
    await firstBasketItem.isProductNameVisible();
    await firstBasketItem.isProductTotalPriceVisible();
    await firstBasketItem.isProductQuantityVisible();
    await basketModal.isBasketPriceVisible();
    await basketModal.goToBasketPage();

    const basketPage = new BasketPage(page);
    await basketPage.isPageOpen();    
  });

  test('Add 9 product items(one type) with discount in basket', async ({ page }) => {    
    const numberItemsToAdd = 9;
    const productsPage = new ProductsPage(page);    
    await productsPage.addNumberOfDiscountedOneTypeItemsInBasket(numberItemsToAdd);

    const mainPage = new MainPage(page);
    await mainPage.checkBasketItemsAmoutn(numberItemsToAdd);

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

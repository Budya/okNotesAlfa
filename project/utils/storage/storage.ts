import { Basket } from "./basket";

export class BasketStorage {
    private static instance: BasketStorage;
    private basket: Basket;

    private constructor() {
       this.basket = new Basket()
    }
    
    public static getStorage(): BasketStorage {
        if (!BasketStorage.instance) {
            BasketStorage.instance = new BasketStorage();
        }
        return BasketStorage.instance;
    }

    getBasket(): Basket {
        return this.basket;
    }
}
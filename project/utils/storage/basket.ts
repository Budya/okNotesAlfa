import { Item } from "./basketItem";

export class Basket {
  private items: Item[]; 

  constructor() {
    this.items = [];
  }

  getBasketPrice(): number {
    return this.items.reduce((acc, item) => acc + item.getTotalPrice(), 0);
  }

  addItem(item: Item) {
    if(this.items.length > 0) {
      // console.log(this.items);
      this.items.find((storageItem, index) => {
        if(storageItem.getName() === item.getName()) {
          this.items[index].addQuantity(item.getQuantity());
          return;
        }
      })
    }
    
    this.items.push(item);
    // console.log(this.items);
  }

  removeItem(item: Item) {
    if(this.items.length > 0) {
      this.items.find((storageItem, index) => {
        if(storageItem.getName() === item.getName()) {
          this.items.splice(index, 1);
        }
      })
    }
  }

  sortItems() {
    return this.items.sort((one, two) => (one > two ? -1 : 1))
  }
}
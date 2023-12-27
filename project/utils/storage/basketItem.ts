export class Item {
  private name: string
  private itemPrice: number;
  private quantity: number;   

  constructor(name: string, itemPrice: number, quantity: number) {
    this.name = name;
    this.itemPrice = itemPrice;
    this.quantity = quantity;
  }  

  getName(): string {
    return this.name;
  }

  getItemPrice(): number {
    return this.itemPrice;
  }

  getQuantity(): number {
    return this.quantity;
  }

  addQuantity(amount: number): void {
    this.quantity += amount;
  }

  getTotalPrice(): number {
    return this.quantity * this.itemPrice;
  }
}
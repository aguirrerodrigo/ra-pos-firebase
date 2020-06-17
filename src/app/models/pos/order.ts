import { OrderItem } from './order-item';
import { Discount } from './discount';

export class Order {
	items: OrderItem[] = [];
	createDate = new Date();
	checkoutDate?: Date;
	discount = new Discount();
	cash = 0;

	get count(): number {
		let count = 0;
		for (const item of this.items) {
			count += item.quantity;
		}

		return count;
	}

	get total(): number {
		let total = 0;
		for (const item of this.items) {
			total += item.total;
		}

		return total;
	}

	get totalDiscount(): number {
		if (this.discount.isPercentage) {
			return (this.discount.value / 100) * this.total;
		} else {
			return this.discount.value;
		}
	}

	get afterDiscount(): number {
		return this.total - this.totalDiscount;
	}

	get change(): number {
		return this.cash - this.afterDiscount;
	}
}

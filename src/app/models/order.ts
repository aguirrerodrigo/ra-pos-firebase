import { OrderItem } from './order-item';

export class Order {
	items: OrderItem[] = [];
	startDate = new Date();
	endDate?: Date;

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
}

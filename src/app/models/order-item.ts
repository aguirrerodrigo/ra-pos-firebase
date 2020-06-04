import { MenuItem } from './menu-item';

export class OrderItem {
	id: any;
	name = '';
	description = '';
	price = 0;
	quantity = 1;
	custom = false;

	get total(): number {
		return this.price * this.quantity;
	}

	constructor(menuItem?: MenuItem, quantitiy?: number) {
		if (menuItem != null) {
			this.name = menuItem.name;
			this.description = menuItem.description;
			this.price = menuItem.price;
			this.custom = menuItem.custom;
		}

		if (quantitiy != null) {
			this.quantity = quantitiy;
		}
	}
}

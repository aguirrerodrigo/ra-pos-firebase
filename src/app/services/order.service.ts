import { Injectable, EventEmitter } from '@angular/core';
import { Order } from '@app/models/order';
import { MenuItem } from '@app/models/menu-item';
import { OrderItem } from '@app/models/order-item';
import { OrderItemRepository } from '@app/repositories/order-item-repository';

@Injectable({
	providedIn: 'root'
})
export class OrderService {
	private _order = new Order();

	get order(): Order {
		return this._order;
	}
	readonly orderChange = new EventEmitter();
	readonly orderUpdate = new EventEmitter();
	readonly itemEdit = new EventEmitter<OrderItem>();

	constructor(private repo: OrderItemRepository) {
		repo.listChange.subscribe(() => (this._order.items = this.repo.list));
	}

	new(): void {
		this.repo.clear();
		this._order = new Order();
		this.orderChange.emit();
	}

	add(menuItem: MenuItem, quantity: number = 1): void {
		if (quantity <= 0) {
			quantity = 1;
		}

		const ref = this.repo.getByNameAndPrice(menuItem.name, menuItem.price);
		if (ref != null) {
			ref.quantity += quantity;
			this.repo.save(ref);
		} else {
			this.repo.save(new OrderItem(menuItem, quantity));
		}
		this.orderUpdate.emit();
	}

	save(orderItem: OrderItem): void {
		this.repo.save(orderItem);
		this.orderUpdate.emit();
	}

	delete(orderItem: OrderItem): void {
		this.repo.delete(orderItem);
		this.orderUpdate.emit();
	}
}

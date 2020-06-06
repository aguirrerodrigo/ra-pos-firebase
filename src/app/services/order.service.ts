import { Injectable, EventEmitter } from '@angular/core';
import { Order } from '@app/models/order';
import { MenuItem } from '@app/models/menu-item';
import { OrderItem } from '@app/models/order-item';
import { OrderRepository } from '@app/repositories/order-repository';
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

	constructor(
		private orderRepo: OrderRepository,
		private orderItemRepo: OrderItemRepository
	) {
		orderRepo.orderChange.subscribe(() => {
			this._order = this.orderRepo.order;
			this.orderChange.emit();
		});
		orderItemRepo.listChange.subscribe(() => {
			this._order.items = this.orderItemRepo.list;
			this.orderUpdate.emit();
		});
	}

	new(): void {
		this.orderRepo.new();
		this.orderItemRepo.clear();
		this.orderChange.emit();
	}

	add(menuItem: MenuItem, quantity: number = 1): void {
		if (quantity <= 0) {
			quantity = 1;
		}

		if (this.order.items.length === 0) {
			this.order.createDate = new Date();
			this.orderRepo.update({ createDate: this.order.createDate });
		}

		const ref = this.orderItemRepo.getByNameAndPrice(
			menuItem.name,
			menuItem.price
		);
		if (ref != null) {
			ref.quantity += quantity;
			this.orderItemRepo.save(ref);
		} else {
			this.orderItemRepo.save(new OrderItem(menuItem, quantity));
		}
		this.orderUpdate.emit();
	}

	increaseQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity < 9999) {
			orderItem.quantity++;

			this.orderItemRepo.update(orderItem.id, {
				quantity: orderItem.quantity
			});
		}
	}

	decreaseQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity > 1) {
			orderItem.quantity--;

			this.orderItemRepo.update(orderItem.id, {
				quantity: orderItem.quantity
			});
		}
	}

	save(orderItem: OrderItem): void {
		this.orderItemRepo.save(orderItem);
		this.orderUpdate.emit();
	}

	delete(orderItem: OrderItem): void {
		this.orderItemRepo.delete(orderItem);
		this.orderUpdate.emit();
	}
}

import { Injectable, EventEmitter } from '@angular/core';
import { Order } from '@app/models/pos/order';
import { MenuItem } from '@app/models/menu-item';
import { OrderItem } from '@app/models/pos/order-item';
import { PosOrderRepository } from '@app/repositories/pos-order-repository';
import { PosItemRepository } from '@app/repositories/pos-item-repository';

@Injectable({
	providedIn: 'root'
})
export class PosService {
	private _order: Order;

	get order(): Order {
		return this._order;
	}

	readonly orderChange = new EventEmitter();
	readonly orderUpdate = new EventEmitter();

	readonly itemEdit = new EventEmitter<OrderItem>();

	constructor(
		private posOrderRepo: PosOrderRepository,
		private posItemRepo: PosItemRepository
	) {
		this._order = this.posOrderRepo.order;

		this.posOrderRepo.orderChange.subscribe(() => {
			this._order = this.posOrderRepo.order;
			this.orderChange.emit();
		});
		this.posItemRepo.listChange.subscribe(() => {
			this.order.items = this.posItemRepo.list;
			this.orderUpdate.emit();
		});
	}

	addItem(menuItem: MenuItem, quantity: number = 1): void {
		if (quantity <= 0) {
			quantity = 1;
		}

		if (this.order.items.length === 0) {
			this.order.createDate = new Date();
			this.posOrderRepo.update({
				createDate: this.order.createDate.toISOString()
			});
		}

		const ref = this.posItemRepo.getByNameAndPrice(
			menuItem.name,
			menuItem.price
		);
		if (ref != null) {
			ref.quantity += quantity;
			this.posItemRepo.save(ref);
		} else {
			this.posItemRepo.save(new OrderItem(menuItem, quantity));
		}
		this.orderUpdate.emit();
	}

	increaseItemQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity < 9999) {
			orderItem.quantity++;

			this.posItemRepo.update(orderItem.id, {
				quantity: orderItem.quantity
			});
		}
	}

	decreaseItemQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity > 1) {
			orderItem.quantity--;

			this.posItemRepo.update(orderItem.id, {
				quantity: orderItem.quantity
			});
		}
	}

	saveItem(orderItem: OrderItem): void {
		this.posItemRepo.save(orderItem);
		this.orderUpdate.emit();
	}

	deleteItem(orderItem: OrderItem): void {
		this.posItemRepo.delete(orderItem);
		this.orderUpdate.emit();
	}

	checkout(): void {
		this.order.checkoutDate = new Date();
		this.posOrderRepo.save(this.order);
		this.posOrderRepo.new();
		this.posItemRepo.clear();
		this.orderChange.emit();
	}
}

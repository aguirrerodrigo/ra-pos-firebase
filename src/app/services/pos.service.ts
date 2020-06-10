import { Injectable, EventEmitter } from '@angular/core';
import { Order } from '@app/models/pos/order';
import { MenuItem } from '@app/models/menu-item';
import { OrderItem } from '@app/models/pos/order-item';
import { PosOrderRepository } from '@app/repositories/pos-order-repository';
import { PosItemRepository } from '@app/repositories/pos-item-repository';
import { OrderRepository } from '../repositories/order-repository';
import { Subject, Observable } from 'rxjs';
import { debounceTime, buffer } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class PosService {
	private _order: Order;
	private readonly updateQuantity = new Subject<OrderItem>();

	get order(): Order {
		return this._order;
	}

	readonly orderChange = new EventEmitter();
	readonly orderUpdate = new EventEmitter();

	readonly itemEdit = new EventEmitter<OrderItem>();

	constructor(
		private posOrderRepo: PosOrderRepository,
		private posItemRepo: PosItemRepository,
		private orderRepo: OrderRepository
	) {
		this._order = this.posOrderRepo.order;
		const debounce = this.updateQuantity.pipe(debounceTime(500));
		this.updateQuantity
			.pipe(buffer(debounce))
			.subscribe((items: OrderItem[]) => {
				const set = new Set<OrderItem>(items);
				for (const item of set) {
					this.posItemRepo.update(item.id, {
						quantity: item.quantity
					});
				}
			});

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

			this.updateQuantity.next(orderItem);
		}
	}

	decreaseItemQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity > 1) {
			orderItem.quantity--;

			this.updateQuantity.next(orderItem);
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
		this.orderRepo.add(this.order);
		this.posOrderRepo.new();
		this.posItemRepo.clear();
		this.orderChange.emit();
	}
}

import { Injectable, EventEmitter } from '@angular/core';
import { Order } from '@app/models/pos/order';
import { MenuItem } from '@app/models/menu-item';
import { OrderItem } from '@app/models/pos/order-item';
import { Order as KitchenOrder } from '@app/models/kitchen/order';
import { OrderItem as KitchenOrderItem } from '@app/models/kitchen/order-item';
import { PosOrderRepository } from '@app/repositories/pos-order-repository';
import { PosItemRepository } from '@app/repositories/pos-item-repository';
import { KitchenOrderRepository } from '@app/repositories/kitchen-order-repository';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, buffer } from 'rxjs/operators';
import { OrderItemSet } from './models/order-item-set';
import { Data } from '@app/utils';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class PosService {
	private _order = new Order();
	private items = new OrderItemSet();
	private orderSubscription: Subscription;
	private itemsSubscription: Subscription;
	private posId = 1;
	private readonly updateQuantity = new Subject<OrderItem>();
	private readonly debounce = this.updateQuantity.pipe(debounceTime(500));

	get order(): Order {
		return this._order;
	}

	readonly orderChange = new EventEmitter();
	readonly orderUpdate = new EventEmitter();

	readonly itemEdit = new EventEmitter<OrderItem>();

	constructor(
		private posOrderRepo: PosOrderRepository,
		private posItemRepo: PosItemRepository,
		private kitchenOrderRepo: KitchenOrderRepository
	) {
		this.updateQuantity
			.pipe(buffer(this.debounce))
			.subscribe((items: OrderItem[]) => {
				const set = new Set<OrderItem>(items);
				for (const item of set) {
					this.posItemRepo.update(this.posId, item.id, {
						quantity: item.quantity
					});
				}
			});
	}

	init(posId: any): void {
		if (posId == null) return;
		if (this.orderSubscription != null) this.orderSubscription.unsubscribe();
		if (this.itemsSubscription != null) this.itemsSubscription.unsubscribe();

		this.posId = posId;
		this.orderSubscription = this.posOrderRepo
			.get(posId)
			.subscribe((order: Order) => this.mergeOrder(order));

		this.itemsSubscription = this.posItemRepo
			.list(posId)
			.subscribe((items: OrderItem[]) => this.mergeItems(items));
	}

	private mergeOrder(order: Order): void {
		if (order != null) {
			if (
				Data.merge(
					this._order,
					{ createDate: order.createDate },
					{
						createDate: {
							equality: (value1: any, value2: any): boolean =>
								moment(value1).isSame(value2)
						}
					}
				)
			) {
				console.log('PosService.mergeOrder: merged.');
			} else {
				console.log('PosService.mergeOrder: no merge done.');
			}
		}
	}

	private mergeItems(items: OrderItem[]): void {
		let dirty = false;

		for (const item of items) {
			const merge = this.items.merge(item);
			if (merge.success) {
				dirty = true;
			}
			Data.keep(merge.ref);
		}

		for (const ref of this.items.toArray()) {
			if (Data.isKeep(ref) !== true) {
				this.items.delete(ref);
				dirty = true;
			} else {
				Data.clearKeep(ref);
			}
		}

		this.order.items = [...this.items.toArray()];
		if (dirty) {
			console.log('PosService.mergeItems: merged.');
			this.orderUpdate.emit();
		} else {
			console.log('PosService.mergeItems: no merge done.');
		}
	}

	addItem(menuItem: MenuItem, quantity: number = 1): void {
		if (quantity <= 0) {
			quantity = 1;
		}

		if (this.order.items.length === 0) {
			this.order.createDate = new Date();
			this.posOrderRepo.update(this.posId, {
				createDate: this.order.createDate.toISOString()
			});
		}

		const ref = this.items.getByNameAndPrice(menuItem.name, menuItem.price);
		if (ref != null) {
			ref.quantity += quantity;
			this.posItemRepo.update(this.posId, ref.id, {
				quantity: ref.quantity
			});
		} else {
			this.posItemRepo.createId().then((id: any) => {
				const orderItem = new OrderItem(menuItem, quantity);
				orderItem.id = id;
				this.items.set(orderItem);
				this.order.items = [...this.items.toArray()];
				this.posItemRepo.save(this.posId, orderItem);
			});
		}

		this.orderUpdate.emit();
	}

	increaseItemQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity < 9999) {
			orderItem.quantity++;

			this.updateQuantity.next(orderItem);
			this.orderUpdate.emit();
		}
	}

	decreaseItemQuantity(orderItem: OrderItem): void {
		if (orderItem.quantity > 1) {
			orderItem.quantity--;

			this.updateQuantity.next(orderItem);
			this.orderUpdate.emit();
		}
	}

	saveItem(orderItem: OrderItem): void {
		this.items.merge(orderItem);
		this.posItemRepo.save(this.posId, orderItem);
		this.orderUpdate.emit();
	}

	deleteItem(orderItem: OrderItem): void {
		this.items.delete(orderItem);
		this.order.items = [...this.items.toArray()];
		this.posItemRepo.delete(this.posId, orderItem);
		this.orderUpdate.emit();
	}

	checkout(): void {
		this._order.checkoutDate = new Date();
		this.saveKitchenOrder(this._order);

		this._order = new Order();
		this.posItemRepo.clear(this.posId);

		this.orderChange.emit();
	}

	saveKitchenOrder(order: Order): void {
		this.kitchenOrderRepo.createId().then((id: any) => {
			const kitchenOrder = new KitchenOrder();
			kitchenOrder.id = id;
			kitchenOrder.startDate = order.checkoutDate;

			const map = new Map<string, number>();
			for (const item of order.items) {
				if (map.has(item.name)) {
					map.set(item.name, map.get(item.name) + item.quantity);
				} else {
					map.set(item.name, item.quantity);
				}
			}

			for (const item of map.entries()) {
				const orderItem = new KitchenOrderItem();
				orderItem.name = item[0];
				orderItem.quantity = item[1];
				kitchenOrder.items.push(orderItem);
			}

			this.kitchenOrderRepo.save(kitchenOrder);
		});
	}
}

import { Injectable, EventEmitter } from '@angular/core';
import { OrderItem } from '@app/models/order-item';
import { key, isNullOrWhiteSpace } from '@app/utils';

@Injectable({
	providedIn: 'root'
})
export class OrderItemRepository {
	private static id = 0;

	private nameAndPriceMap = new Map<any, OrderItem>();
	private idMap = new Map<any, OrderItem>();
	private set = new Set<OrderItem>();

	get list(): OrderItem[] {
		return [...this.set];
	}
	listChange = new EventEmitter();

	private static seed(): number {
		return ++OrderItemRepository.id;
	}

	clear(): void {
		this.nameAndPriceMap.clear();
		this.idMap.clear();
		this.set.clear();
		this.listChange.emit();
	}

	getById(id: string): OrderItem {
		return this.idMap.get(id);
	}

	getByNameAndPrice(name: string, price: number): OrderItem {
		return this.nameAndPriceMap.get(key(name, price));
	}

	save(orderItem: OrderItem): void {
		if (orderItem.id == null) {
			this.add(orderItem);
		} else {
			const ref = this.getById(orderItem.id);
			if (ref == null) {
				this.add(orderItem);
			} else {
				ref.custom = orderItem.custom;
				ref.description = orderItem.description;
				ref.name = orderItem.name;
				ref.price = orderItem.price;
				ref.quantity = orderItem.quantity;
			}
		}
	}

	private add(orderItem: OrderItem): void {
		if (isNullOrWhiteSpace(orderItem.id)) {
			orderItem.id = OrderItemRepository.seed();
		}
		this.idMap.set(orderItem.id, orderItem);
		this.nameAndPriceMap.set(key(orderItem.name, orderItem.price), orderItem);
		this.set.add(orderItem);
		this.listChange.emit();
	}

	delete(orderItem: OrderItem): void {
		const ref = this.idMap.get(orderItem.id);
		if (ref != null) {
			this.idMap.delete(ref.id);
			this.nameAndPriceMap.delete(key(ref.name, ref.price));
			this.set.delete(ref);
			this.listChange.emit();
		}
	}
}

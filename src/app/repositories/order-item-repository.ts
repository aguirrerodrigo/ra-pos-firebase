import { Injectable, EventEmitter } from '@angular/core';
import { OrderItem } from '@app/models/order-item';
import { key, isNullOrWhiteSpace, keep, isKeep, clearKeep } from '@app/utils';
import { AngularFireDatabase } from '@angular/fire/database';

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

	constructor(private db: AngularFireDatabase) {
		db.list('order/items')
			.valueChanges()
			.subscribe((items: OrderItem[]) => {
				this.merge(items);
			});
	}

	private merge(items: OrderItem[]): void {
		let dirty = false;

		for (const item of items) {
			let ref = this.getById(item.id);
			if (ref != null) {
				const name = ref.name;
				const price = ref.price;
				if (Object.assign(ref, item)) {
					this.nameAndPriceMap.delete(key(name, price));
					this.nameAndPriceMap.set(key(ref.name, ref.price), ref);
					dirty = true;
				}
			} else {
				ref = new OrderItem();
				Object.assign(ref, item);
				this.idMap.set(ref.id, ref);
				this.nameAndPriceMap.set(key(ref.name, ref.price), ref);
				this.set.add(ref);
				dirty = true;
			}

			keep(ref);
		}

		for (const ref of this.set) {
			if (isKeep(ref) !== true) {
				this.idMap.delete(ref.id);
				this.nameAndPriceMap.delete(key(ref.name, ref.price));
				this.set.delete(ref);
				dirty = true;
			} else {
				clearKeep(ref);
			}
		}

		if (dirty) {
			this.listChange.emit();
		}
	}

	clear(): void {
		this.nameAndPriceMap.clear();
		this.idMap.clear();
		this.set.clear();
		this.listChange.emit();

		this.db.object('order/items').remove();
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
				Object.assign(ref, orderItem);

				this.db.object('order/items/' + orderItem.id).update(orderItem);
			}
		}
	}

	private add(orderItem: OrderItem): void {
		if (isNullOrWhiteSpace(orderItem.id)) {
			orderItem.id = this.db.createPushId();
		}
		this.idMap.set(orderItem.id, orderItem);
		this.nameAndPriceMap.set(key(orderItem.name, orderItem.price), orderItem);
		this.set.add(orderItem);
		this.listChange.emit();

		this.db.object('order/items/' + orderItem.id).set(orderItem);
	}

	delete(orderItem: OrderItem): void {
		const ref = this.idMap.get(orderItem.id);
		if (ref != null) {
			this.idMap.delete(ref.id);
			this.nameAndPriceMap.delete(key(ref.name, ref.price));
			this.set.delete(ref);
			this.listChange.emit();

			this.db.object('order/items/' + ref.id).remove();
		}
	}
}

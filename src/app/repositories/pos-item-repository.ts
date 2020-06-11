import { Injectable, EventEmitter } from '@angular/core';
import { OrderItem } from '@app/models/pos/order-item';
import { AngularFireDatabase } from '@angular/fire/database';
import { Data, Str } from '@app/utils';

@Injectable({
	providedIn: 'root'
})
export class PosItemRepository {
	private nameAndPriceMap = new Map<any, OrderItem>();
	private idMap = new Map<any, OrderItem>();
	private set = new Set<OrderItem>();

	get list(): OrderItem[] {
		return [...this.set];
	}
	listChange = new EventEmitter();

	constructor(private db: AngularFireDatabase) {
		db.list('pos/items')
			.valueChanges()
			.subscribe((items: any[]) => {
				this.merge(items);
			});
	}

	private merge(items: any[]): void {
		let dirty = false;

		for (const item of items) {
			let ref = this.getById(item.id);
			if (ref != null) {
				const name = ref.name;
				const price = ref.price;
				if (Data.merge(ref, item)) {
					this.nameAndPriceMap.delete(Data.key(name, price));
					this.nameAndPriceMap.set(Data.key(ref.name, ref.price), ref);
					dirty = true;
				}
			} else {
				ref = new OrderItem();
				Data.merge(ref, item);
				this.idMap.set(ref.id, ref);
				this.nameAndPriceMap.set(Data.key(ref.name, ref.price), ref);
				this.set.add(ref);
				dirty = true;
			}

			Data.keep(ref);
		}

		for (const ref of this.set) {
			if (Data.isKeep(ref) !== true) {
				this.idMap.delete(ref.id);
				this.nameAndPriceMap.delete(Data.key(ref.name, ref.price));
				this.set.delete(ref);
				dirty = true;
			} else {
				Data.clearKeep(ref);
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

		this.db.object('pos/items').remove();
	}

	getById(id: string): OrderItem {
		return this.idMap.get(id);
	}

	getByNameAndPrice(name: string, price: number): OrderItem {
		return this.nameAndPriceMap.get(Data.key(name, price));
	}

	update(id: any, data: any): void {
		this.db.object('pos/items/' + id).update(data);
	}

	save(orderItem: OrderItem): void {
		if (orderItem.id == null) {
			this.add(orderItem);
		} else {
			const ref = this.getById(orderItem.id);
			if (ref == null) {
				this.add(orderItem);
			} else {
				Data.merge(ref, orderItem);

				this.db.object('pos/items/' + orderItem.id).update(orderItem);
			}
		}
	}

	private add(orderItem: OrderItem): void {
		if (Str.isNullOrWhiteSpace(orderItem.id)) {
			orderItem.id = this.db.createPushId();
		}
		this.idMap.set(orderItem.id, orderItem);
		this.nameAndPriceMap.set(
			Data.key(orderItem.name, orderItem.price),
			orderItem
		);
		this.set.add(orderItem);
		this.listChange.emit();

		this.db.object('pos/items/' + orderItem.id).set(orderItem);
	}

	delete(orderItem: OrderItem): void {
		const ref = this.idMap.get(orderItem.id);
		if (ref != null) {
			this.idMap.delete(ref.id);
			this.nameAndPriceMap.delete(Data.key(ref.name, ref.price));
			this.set.delete(ref);
			this.listChange.emit();

			this.db.object('pos/items/' + ref.id).remove();
		}
	}
}
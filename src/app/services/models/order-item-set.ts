import { OrderItem } from '@app/models/pos/order-item';
import { Data } from '@app/utils';

export class OrderItemSet {
	private nameAndPriceMap = new Map<any, OrderItem>();
	private idMap = new Map<any, OrderItem>();
	private _set = new Set<OrderItem>();

	toArray(): OrderItem[] {
		return [...this._set];
	}

	getById(id: string): OrderItem {
		return this.idMap.get(id);
	}

	getByNameAndPrice(name: string, price: number): OrderItem {
		return this.nameAndPriceMap.get(Data.key(name, price));
	}

	set(item: OrderItem): void {
		this._set.add(item);
		this.idMap.set(item.id, item);
		this.nameAndPriceMap.set(Data.key(item.name, item.price), item);
	}

	merge(item: OrderItem): { success: boolean; ref: OrderItem } {
		if (this._set.has(item)) {
			console.log(
				`merge item:${Data.key(
					item.name,
					item.price
				)} failed, same reference.`
			);
			return { success: false, ref: item };
		} else {
			const ref = this.getById(item.id);
			if (ref != null) {
				const name = ref.name;
				const price = ref.price;
				if (Data.merge(ref, item)) {
					this.nameAndPriceMap.delete(Data.key(name, price));
					this.nameAndPriceMap.set(Data.key(ref.name, ref.price), ref);
					console.log(
						`merge item:${Data.key(item.name, item.price)} success.`
					);
					return { success: true, ref };
				} else {
					console.log(
						`merge item:${Data.key(
							item.name,
							item.price
						)} failed, no changes.`
					);
					return { success: false, ref };
				}
			} else {
				this.set(item);
				console.log(
					`merge item:${Data.key(
						item.name,
						item.price
					)} success, new item.`
				);
				return { success: true, ref: item };
			}
		}
	}

	delete(item: OrderItem): void {
		this.nameAndPriceMap.delete(Data.key(item.name, item.price));
		this.idMap.delete(item.id);
		this._set.delete(item);
	}
}

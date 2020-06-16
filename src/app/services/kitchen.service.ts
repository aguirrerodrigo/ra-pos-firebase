import { Injectable, EventEmitter } from '@angular/core';
import { KitchenOrderRepository } from '@app/repositories/kitchen-order-repository';
import { Order } from '@app/models/kitchen/order';
import { Data } from '@app/utils';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class KitchenService {
	private _orders = new Map<any, Order>();
	readonly orderChange = new EventEmitter();

	get orders(): Order[] {
		return [...this._orders.values()];
	}

	constructor(private repo: KitchenOrderRepository) {
		this.repo.list().subscribe((items: Order[]) => this.merge(items));
	}

	merge(items: Order[]): void {
		for (const item of items) {
			const ref = this._orders.get(item.id);
			if (ref == null) {
				this._orders.set(item.id, item);
				this.orderChange.emit();
			} else {
				if (
					Data.merge(ref, item, {
						startDate: {
							equality: (value1: any, value2: any): boolean =>
								moment(value1).isSame(value2)
						}
					})
				) {
					this.orderChange.emit();
				}
			}
		}
	}
}

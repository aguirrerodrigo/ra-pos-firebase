import { Injectable, OnDestroy, EventEmitter } from '@angular/core';
import { settings } from '@root/src/environments/settings';
import { KitchenOrderRepository } from '@app/repositories/kitchen-order-repository';
import { Order } from '@app/models/kitchen/order';
import { Data } from '@app/utils';
import { interval, Subscription } from 'rxjs';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class KitchenService implements OnDestroy {
	private expired = moment.duration(settings.kitchen.expire);
	private interval = interval(1000);
	private intervalSubscription: Subscription;
	private _orders = new Map<any, Order>();
	readonly ordersChange = new EventEmitter();

	get orders(): Order[] {
		return [...this._orders.values()];
	}

	constructor(private repo: KitchenOrderRepository) {
		this.repo.list().subscribe((items: Order[]) => this.merge(items));
		this.intervalSubscription = this.interval.subscribe(() =>
			this.expireOrders()
		);
	}

	ngOnDestroy(): void {
		this.intervalSubscription.unsubscribe();
	}

	merge(items: Order[]): void {
		for (const item of items) {
			if (this.isExpired(item)) {
				this.expire(item);
			} else {
				const ref = this._orders.get(item.id);
				if (ref == null) {
					this._orders.set(item.id, item);
					this.ordersChange.emit();
				} else {
					if (
						Data.merge(ref, item, {
							startDate: {
								equality: (value1: any, value2: any): boolean =>
									moment(value1).isSame(value2)
							}
						})
					) {
						this.ordersChange.emit();
					}
				}
			}
		}
	}

	private isExpired(order: Order): boolean {
		const elapsed = moment.duration(moment().diff(order.startDate));
		return elapsed > this.expired;
	}

	private expire(order: Order): void {
		console.log(`KitchenService.expire: ${JSON.stringify(order)}`);
		this._orders.delete(order.id);
		this.ordersChange.emit();
		this.repo.delete(order);
	}

	private expireOrders(): void {
		for (const order of this._orders.values()) {
			if (this.isExpired(order)) {
				this.expire(order);
			}
		}
	}

	complete(order: Order): void {
		console.log(`KitchenService.complete: ${JSON.stringify(order)}`);
		this._orders.delete(order.id);
		this.ordersChange.emit();
		this.repo.delete(order);
	}
}

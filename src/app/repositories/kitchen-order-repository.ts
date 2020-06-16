import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Order } from '@app/models/kitchen/order';
import { OrderItem } from '@app/models/kitchen/order-item';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class KitchenOrderRepository {
	constructor(private db: AngularFireDatabase) {}

	list(): Observable<Order[]> {
		return this.db
			.list('kitchen/orders')
			.valueChanges()
			.pipe(
				tap((items: any[]) =>
					console.log(
						`KitchenOrderRepository.list: ${JSON.stringify(items)}`
					)
				),
				map((items: any[]) => {
					items = items || [];
					const result: Order[] = [];
					for (const item of items) {
						const order = new Order();
						order.id = item.id;
						order.items = this.mapItems(item.items);
						order.startDate = new Date(item.startDate);

						result.push(order);
					}
					return result;
				})
			);
	}

	private mapItems(items: any): OrderItem[] {
		const result: OrderItem[] = [];
		for (const prop in items) {
			if (items.hasOwnProperty(prop)) {
				const orderItem = new OrderItem();
				orderItem.name = prop;
				orderItem.quantity = items[prop];

				result.push(orderItem);
			}
		}

		return result;
	}

	update(id: any, data: any): Promise<void> {
		console.log(
			`KitchenOrderRepository.update: ${JSON.stringify({ id, data })}`
		);
		return this.db.object(`kitchen/orders/${id}`).update(data);
	}

	save(order: Order): Promise<void> {
		const items = {};
		for (const item of order.items) {
			items[item.name] = item.quantity;
		}
		return this.db.object(`kitchen/orders/${order.id}`).set({
			id: order.id,
			startDate: order.startDate.toISOString(),
			items
		});
	}
}

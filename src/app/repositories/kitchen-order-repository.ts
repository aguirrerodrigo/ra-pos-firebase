import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { DatabaseReference } from '@angular/fire/database/interfaces';
import { Order } from '@app/models/kitchen/order';
import { OrderItem } from '@app/models/kitchen/order-item';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class KitchenOrderRepository {
	constructor(private db: AngularFireDatabase) {}

	list(): Observable<Order[]> {
		return this.db
			.list('kitchen/orders', (ref: DatabaseReference) =>
				ref.orderByChild('id')
			)
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

	createId(): Promise<any> {
		return this.db.database
			.ref('kitchen/_shared/last')
			.transaction((t: any) => {
				t = t || {};
				t.id = t.id || 0;

				if (
					t.createDate != null &&
					moment(t.createDate).startOf('day') < moment().startOf('day')
				) {
					t.id = 1;
				} else {
					t.id++;
				}

				t.createDate = new Date().toISOString();
				console.log(
					`KitchenOrderRepository.createId: ${JSON.stringify(t)}`
				);
				return t;
			})
			.then((r: any) => r.snapshot.val().id);
	}

	update(id: any, data: any): Promise<void> {
		console.log(
			`KitchenOrderRepository.update: ${JSON.stringify({ id, data })}`
		);
		return this.db.object(`kitchen/orders/${id}`).update(data);
	}

	save(order: Order): Promise<void> {
		const data = {
			id: order.id,
			startDate: order.startDate.toISOString(),
			items: {}
		};

		for (const item of order.items) {
			data.items[item.name] = item.quantity;
		}

		console.log(`KitchenOrderRepository.save: ${JSON.stringify(data)}`);
		return this.db.object(`kitchen/orders/${order.id}`).set(data);
	}

	delete(order: Order): Promise<void> {
		console.log('PosOrderRepository.delete');
		return this.db.object(`kitchen/orders/${order.id}`).remove();
	}
}

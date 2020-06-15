import { Injectable } from '@angular/core';
import { OrderItem } from '@app/models/pos/order-item';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root'
})
export class PosItemRepository {
	constructor(private db: AngularFireDatabase) {}

	list(posId: any): Observable<OrderItem[]> {
		return this.db
			.list(`pos/${posId}/items`)
			.valueChanges()
			.pipe(
				tap((v: any) =>
					console.log(`PosItemRepository.get: ${JSON.stringify(v)}`)
				),
				map((items: any[]) => {
					items = items || [];
					const result: OrderItem[] = [];
					for (const item of items) {
						const orderItem = new OrderItem();
						orderItem.custom = item.custom || false;
						orderItem.description = item.description;
						orderItem.id = item.id;
						orderItem.name = item.name;
						orderItem.price = item.price || 0;
						orderItem.quantity = item.quantity || 0;

						result.push(orderItem);
					}
					return result;
				})
			);
	}

	createId(): Promise<any> {
		const id = this.db.createPushId();
		console.log(`PosItemRepository.createId: ${id}`);

		return Promise.resolve(id);
	}

	update(posId: any, id: any, data: any): Promise<void> {
		console.log(`PosItemRepository.update: ${JSON.stringify({ id, data })}`);
		return this.db.object(`pos/${posId}/items/${id}`).update(data);
	}

	save(posId: any, orderItem: OrderItem): Promise<void> {
		console.log(`PosItemRepository.save: ${JSON.stringify(orderItem)}`);
		return this.db
			.object(`pos/${posId}/items/${orderItem.id}`)
			.set(orderItem);
	}

	delete(posId: any, item: OrderItem): Promise<void> {
		console.log(`PosItemRepository.delete: ${JSON.stringify(item)}`);
		return this.db.object(`pos/${posId}/items/${item.id}`).remove();
	}

	clear(posId: any): Promise<void> {
		console.log('PosItemRepository.clear');
		return this.db.object(`pos/${posId}/items`).remove();
	}
}

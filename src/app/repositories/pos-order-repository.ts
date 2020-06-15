import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Order } from '@app/models/pos/order';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class PosOrderRepository {
	constructor(private db: AngularFireDatabase) {}

	get(posId: any): Observable<Order> {
		return this.db
			.object(`pos/${posId}/order`)
			.valueChanges()
			.pipe(
				tap((v: any) =>
					console.log(`PosOrderRepository.get: ${JSON.stringify(v)}`)
				),
				map((data: any) => {
					if (data == null || data.id == null) {
						return null;
					} else {
						const order = new Order(data.id);
						order.createDate = new Date(data.createDate);
						return order;
					}
				})
			);
	}

	createId(): Promise<any> {
		return this.db.database
			.ref('pos/_shared/last')
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
				console.log(`PosOrderRepository.createId: ${JSON.stringify(t)}`);
				return t;
			})
			.then((r: any) => r.snapshot.val().id);
	}

	update(posId: any, data: any): Promise<void> {
		console.log(`PosOrderRepository.update: ${JSON.stringify(data)}`);
		return this.db.object(`pos/${posId}/order`).update(data);
	}

	save(posId: any, order: Order): Promise<void> {
		console.log(`PosOrderRepository.save: ${JSON.stringify(order)}`);
		return this.db.object(`pos/${posId}/order`).set({
			id: order.id,
			createDate: order.createDate.toISOString()
		});
	}

	delete(posId: any): Promise<void> {
		console.log('PosOrderRepository.delete');
		return this.db.object(`pos/${posId}/order`).remove();
	}
}

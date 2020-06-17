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
						const order = new Order();
						order.createDate = new Date(data.createDate);
						return order;
					}
				})
			);
	}

	update(posId: any, data: any): Promise<void> {
		console.log(`PosOrderRepository.update: ${JSON.stringify(data)}`);
		return this.db.object(`pos/${posId}/order`).update(data);
	}

	save(posId: any, order: Order): Promise<void> {
		console.log(`PosOrderRepository.save: ${JSON.stringify(order)}`);
		return this.db.object(`pos/${posId}/order`).set({
			createDate: order.createDate.toISOString()
		});
	}

	delete(posId: any): Promise<void> {
		console.log('PosOrderRepository.delete');
		return this.db.object(`pos/${posId}/order`).remove();
	}
}

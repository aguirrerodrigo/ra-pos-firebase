import { Injectable, EventEmitter } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { Order } from '@app/models/pos/order';
import { Data } from '@app/utils';
import * as moment from 'moment';

@Injectable({
	providedIn: 'root'
})
export class PosOrderRepository {
	private _order: Order = new Order();

	get order(): Order {
		return this._order;
	}

	readonly orderChange = new EventEmitter();

	constructor(private db: AngularFireDatabase) {
		db.object('pos/order')
			.valueChanges()
			.subscribe((data: any) => {
				this.merge(data);
			});
	}

	merge(data: any): void {
		if (
			Data.merge(this._order, data, {
				createDate: (value: any): Date => new Date(value),
				checkoutDate: (value: any): Date => new Date(value)
			})
		) {
			if (this.verifyId()) {
				this.db.object('pos/order').set({
					id: this._order.id,
					createDate: this._order.createDate.toISOString()
				});
			}
			this.orderChange.emit();
		}
	}

	verifyId(): boolean {
		if (
			moment(this._order.createDate).startOf('day') < moment().startOf('day')
		) {
			this._order.id = 1;
			this.order.createDate = new Date();
			return true;
		}
		return false;
	}

	new(): void {
		this._order = new Order(this._order.id + 1);
		this.verifyId();
		this.orderChange.emit();

		this.db.object('pos/order').set({
			id: this._order.id,
			createDate: this._order.createDate.toISOString()
		});
	}

	update(data: any): void {
		this.db.object('pos/order').update(data);
	}
}

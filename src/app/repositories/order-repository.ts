import { Injectable, EventEmitter } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { AngularFireDatabase } from '@angular/fire/database';
import { Order } from '@app/models/order';
import { Payment } from '@app/models/payment';
import { OrderItem } from '@app/models/order-item';
import { Format } from '@app/utils';

@Injectable({
	providedIn: 'root'
})
export class OrderRepository {
	private _order: Order = new Order();

	get order(): Order {
		return this._order;
	}

	readonly orderChange = new EventEmitter();

	constructor(
		private store: AngularFirestore,
		private db: AngularFireDatabase
	) {
		db.object('order/createDate')
			.valueChanges()
			.subscribe((createDate: Date) => {
				this.order.createDate = new Date(createDate);
				this.orderChange.emit();
			});
	}

	new(): void {
		this._order = new Order();
		this.orderChange.emit();

		this.db.object('order').remove();
	}

	update(data: any): void {
		this.db.object('order').update(data);
	}

	save(order: Order, payment: Payment): void {
		if (order == null || payment == null) return;

		this.store.collection('order').add({
			date: Format.date(new Date()),

			createDate: order.createDate,
			checkoutDate: order.checkoutDate,
			checkoutDuration: Format.duration(
				new Date(order.checkoutDate.getTime() - order.createDate.getTime())
			),
			items: this.formatItems(order.items),
			count: order.count,
			total: order.total,

			discount: payment.totalDiscount,
			discountPercentage: payment.discount.isPercentage
				? payment.discount.value
				: null,
			discountedTotal: payment.afterDiscount,
			cash: payment.cash,
			change: payment.change
		});
	}

	private formatItems(items: OrderItem[]): any[] {
		const result = [];
		for (const item of items) {
			result.push({
				name: item.name,
				description: item.description,
				price: item.price,
				quantity: item.quantity,
				total: item.total
			});
		}

		return result;
	}
}

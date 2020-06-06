import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Order } from '@app/models/order';
import { Payment } from '@app/models/payment';
import { OrderItem } from '@app/models/order-item';
import { Format } from '@app/utils';

@Injectable({
	providedIn: 'root'
})
export class OrderRepository {
	constructor(private store: AngularFirestore) {}

	save(order: Order, payment: Payment): void {
		if (order == null || payment == null) return;

		this.store.collection('order').add({
			date: Format.date(new Date()),

			createDate: Format.dateTime(order.startDate),
			endDate: Format.dateTime(order.endDate),
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

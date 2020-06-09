import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import { Order } from '@app/models/pos/order';
import { OrderItem } from '@app/models/pos/order-item';
import { Format } from '@app/utils';

@Injectable({
	providedIn: 'root'
})
export class OrderRepository {
	constructor(private store: AngularFirestore) {}

	add(order: Order): void {
		if (order == null) return;

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

			discount: order.totalDiscount,
			discountPercentage: order.discount.isPercentage
				? order.discount.value
				: null,
			discountedTotal: order.afterDiscount,
			cash: order.cash,
			change: order.change
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

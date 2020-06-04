import { Injectable, EventEmitter } from '@angular/core';
import { Payment } from '@app/models/payment';
import { OrderService } from './order.service';

@Injectable({
	providedIn: 'root'
})
export class PaymentService {
	private _payment: Payment;
	readonly paymentChange = new EventEmitter();
	readonly paymentUpdate = new EventEmitter();

	get payment(): Payment {
		return this._payment;
	}

	constructor(private orderService: OrderService) {
		this.orderService.orderChange.subscribe(() => {
			this._payment = new Payment(this.orderService.order);
			this.paymentChange.emit();
		});
		this.orderService.orderUpdate.subscribe(() => this.paymentUpdate.emit());
		this._payment = new Payment(this.orderService.order);
	}

	checkout(): void {
		this.orderService.new();
	}
}

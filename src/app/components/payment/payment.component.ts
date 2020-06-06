import { Component } from '@angular/core';
import { Payment } from '@app/models/payment';
import { PaymentService } from '@app/services/payment.service';
import { Format } from '@app/utils';

@Component({
	selector: 'app-payment',
	templateUrl: './payment.component.html',
	styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
	private _discount: string;
	private _cash: string;
	payment: Payment;
	confirm = false;

	get canPay(): boolean {
		return this.payment.afterDiscount <= this.payment.cash;
	}

	get discount(): string {
		return this._discount;
	}

	set discount(value: string) {
		this._discount = value;
		this.payment.discount.isPercentage = value.endsWith('%');
		if (this.payment.discount.isPercentage) {
			value = value.substr(value.length - 1);
		}

		const n = Number(value);
		if (!isNaN(n)) {
			this.payment.discount.value = Math.abs(n);
		}

		this.confirm = false;
	}

	get cash(): string {
		return this._cash;
	}

	set cash(value: string) {
		this._cash = value;
		const n = Number(value);
		if (!isNaN(n)) {
			this.payment.cash = n;
		}

		this.confirm = false;
	}

	constructor(private paymentService: PaymentService) {
		this.paymentService.paymentChange.subscribe(() =>
			this.setPayment(this.paymentService.payment)
		);
		this.paymentService.paymentUpdate.subscribe(() =>
			this.setPayment(this.paymentService.payment)
		);
		this.setPayment(this.paymentService.payment);
	}

	formatDiscountFromValue(): void {
		this._discount =
			this.payment.discount.value.toString() +
			(this.payment.discount.isPercentage ? '%' : '');
	}

	formatDiscount(): void {
		if (this.payment.discount.isPercentage) {
			this._discount = `(-${
				this.payment.discount.value
			}%)  ${Format.phpCurrency(-this.payment.totalDiscount)}`;
		} else {
			this._discount = Format.phpCurrency(-this.payment.totalDiscount);
		}
	}

	formatCashFromValue(): void {
		this._cash = this.payment.cash.toString();
	}

	formatCash(): void {
		this._cash = Format.phpCurrency(this.payment.cash);
	}

	checkout(): void {
		if (!this.confirm) {
			this.confirm = true;
		} else {
			this.paymentService.checkout();
			this.confirm = false;
		}
	}

	private setPayment(payment: Payment): void {
		this.payment = payment;

		this.formatDiscount();
		this.formatCash();

		this.confirm = false;
	}
}

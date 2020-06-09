import { Component } from '@angular/core';
import { Order } from '@app/models/pos/order';
import { PosService } from '@app/services/pos.service';
import { Format } from '@app/utils';

@Component({
	selector: 'app-payment',
	templateUrl: './payment.component.html',
	styleUrls: ['./payment.component.scss']
})
export class PaymentComponent {
	private _discount: string;
	private _cash: string;
	order: Order;
	confirm = false;

	get canPay(): boolean {
		return this.order.afterDiscount <= this.order.cash;
	}

	get discount(): string {
		return this._discount;
	}

	set discount(value: string) {
		this._discount = value;
		this.order.discount.isPercentage = value.endsWith('%');
		if (this.order.discount.isPercentage) {
			value = value.substr(value.length - 1);
		}

		const n = Number(value);
		if (!isNaN(n)) {
			this.order.discount.value = Math.abs(n);
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
			this.order.cash = n;
		}

		this.confirm = false;
	}

	constructor(private posService: PosService) {
		this.posService.orderChange.subscribe(() =>
			this.setOrder(this.posService.order)
		);
		this.posService.orderUpdate.subscribe(() =>
			this.setOrder(this.posService.order)
		);
		this.setOrder(this.posService.order);
	}

	formatDiscountFromValue(): void {
		this._discount =
			this.order.discount.value.toString() +
			(this.order.discount.isPercentage ? '%' : '');
	}

	formatDiscount(): void {
		if (this.order.discount.isPercentage) {
			this._discount = `(-${
				this.order.discount.value
			}%)  ${Format.phpCurrency(-this.order.totalDiscount)}`;
		} else {
			this._discount = Format.phpCurrency(-this.order.totalDiscount);
		}
	}

	formatCashFromValue(): void {
		this._cash = this.order.cash.toString();
	}

	formatCash(): void {
		this._cash = Format.phpCurrency(this.order.cash);
	}

	checkout(): void {
		if (!this.confirm) {
			this.confirm = true;
		} else {
			this.posService.checkout();
			this.confirm = false;
		}
	}

	private setOrder(order: Order): void {
		this.order = order;

		this.formatDiscount();
		this.formatCash();

		this.confirm = false;
	}
}

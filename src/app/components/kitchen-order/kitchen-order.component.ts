import { Component, Input, OnDestroy } from '@angular/core';
import Settings from '@src/assets/json/settings.json';
import { KitchenService } from '@app/services/kitchen.service';
import { Order } from '@app/models/kitchen/order';
import { interval, Subscription } from 'rxjs';
import moment from 'moment';

@Component({
	selector: 'app-kitchen-order',
	templateUrl: './kitchen-order.component.html',
	styleUrls: ['./kitchen-order.component.scss']
})
export class KitchenOrderComponent implements OnDestroy {
	private warning = moment.duration(Settings.kitchen.warning);
	private danger = moment.duration(Settings.kitchen.danger);
	private interval = interval(1000);
	private intervalSubscription: Subscription;
	private _order: Order;
	status: 'success' | 'warning' | 'danger' = 'success';
	elapsed: Date;
	confirm = false;

	get order(): Order {
		return this._order;
	}

	@Input() set order(value: Order) {
		this._order = value;
		this.verifyTime();
	}

	constructor(private kitchenService: KitchenService) {
		this.intervalSubscription = this.interval.subscribe(() =>
			this.verifyTime()
		);
	}

	ngOnDestroy(): void {
		this.intervalSubscription.unsubscribe();
	}

	private verifyTime(): void {
		const elapsed = moment.duration(moment().diff(this.order.startDate));
		if (elapsed > this.danger) {
			this.status = 'danger';
		} else if (elapsed > this.warning) {
			this.status = 'warning';
		} else {
			this.status = 'success';
		}
		this.elapsed = moment().startOf('day').add(elapsed).toDate();
	}

	complete(): void {
		if (this.confirm) {
			this.kitchenService.complete(this._order);
			this.confirm = false;
		} else {
			this.confirm = true;
		}
	}
}

import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Order } from '@app/models/kitchen/order';
import { interval } from 'rxjs';
import moment from 'moment';

@Component({
	selector: 'app-kitchen-order',
	templateUrl: './kitchen-order.component.html',
	styleUrls: ['./kitchen-order.component.scss']
})
export class KitchenOrderComponent {
	private warningTime = '00:15:00';
	private dangerTime = '00:30:00';
	private warning = moment.duration(this.warningTime);
	private danger = moment.duration(this.dangerTime);
	private interval = interval(1000);
	private _order: Order;
	status: 'success' | 'warning' | 'danger' = 'success';
	elapsed: Date;

	get order(): Order {
		return this._order;
	}

	@Input() set order(value: Order) {
		this._order = value;
		this.verifyTime();
	}

	@Output() readonly orderChange = new EventEmitter();

	constructor() {
		this.interval.subscribe(() => this.verifyTime());
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
		this.orderChange.emit();
	}
}

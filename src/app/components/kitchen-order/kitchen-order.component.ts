import { Component, Input } from '@angular/core';
import { Order } from '@app/models/pos/order';

@Component({
	selector: 'app-kitchen-order',
	templateUrl: './kitchen-order.component.html',
	styleUrls: ['./kitchen-order.component.css']
})
export class KitchenOrderComponent {
	@Input() order: Order;

	constructor() {}
}

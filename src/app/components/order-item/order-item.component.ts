import { Component, Input, ViewChild } from '@angular/core';
import { OrderItem } from '@app/models/pos/order-item';
import { PosService } from '@app/services/pos.service';

@Component({
	selector: 'app-order-item',
	templateUrl: './order-item.component.html',
	styleUrls: ['./order-item.component.scss']
})
export class OrderItemComponent {
	@Input() item: OrderItem;

	constructor(private orderService: PosService) {}
}

import { Component } from '@angular/core';
import { PageService } from '@app/services/page.service';
import { KitchenService } from '@app/services/kitchen.service';
import { Order } from '@app/models/kitchen/order';

@Component({
	selector: 'app-kitchen-page',
	templateUrl: './kitchen-page.component.html',
	styleUrls: ['./kitchen-page.component.css']
})
export class KitchenPageComponent {
	orders: Order[] = [];

	constructor(
		private pageService: PageService,
		private kitchenService: KitchenService
	) {
		this.pageService.pageTitle = 'Kitchen';
		this.pageService.windowTitle = 'Kitchen';

		this.kitchenService.orderChange.subscribe(
			() => (this.orders = this.kitchenService.orders)
		);
	}
}

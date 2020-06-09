import { Component, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { PosService } from '@app/services/pos.service';
import { InfoService } from '@app/services/info.service';
import { Order } from '@app/models/pos/order';
import { OrderItem } from '@app/models/pos/order-item';
import { OrderItemComponent } from '@app/components/order-item/order-item.component';

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss']
})
export class OrderComponent {
	title = 'Order';
	randomInfo = '';
	order: Order;
	selectedIndex = 0;

	@ViewChildren(OrderItemComponent, { read: ElementRef })
	orderItems: QueryList<ElementRef>;

	constructor(
		private posService: PosService,
		private infoService: InfoService
	) {
		this.order = posService.order;
		this.posService.orderChange.subscribe(() => {
			this.order = this.posService.order;
			this.selectedIndex = 0;
		});
		this.posService.itemEdit.subscribe((item: OrderItem) =>
			this.onItemEdit(item)
		);
		this.posService.orderUpdate.subscribe(() =>
			this.onOrderUpdate(this.order)
		);
		this.generateRandomInfo();
	}

	onArrowUpKey(e: Event): void {
		e.preventDefault();

		if (this.selectedIndex > 0) {
			this.selectedIndex--;
			this.scrollItemIntoView();
		}
	}

	onArrowDownKey(e: Event): void {
		e.preventDefault();

		if (this.selectedIndex < this.order.items.length - 1) {
			this.selectedIndex++;
			this.scrollItemIntoView();
		}
	}

	onEnterKey(e: Event): void {
		e.preventDefault();

		this.posService.itemEdit.emit(this.order.items[this.selectedIndex]);
	}

	onArrowLeftKey(e: Event): void {
		e.preventDefault();

		if (this.order.items.length === 0) return;

		const item = this.order.items[this.selectedIndex];
		this.posService.decreaseItemQuantity(item);
	}

	onArrowRightKey(e: Event): void {
		e.preventDefault();

		if (this.order.items.length === 0) return;

		const item = this.order.items[this.selectedIndex];
		this.posService.increaseItemQuantity(item);
	}

	onDeleteKey(e: Event): void {
		e.preventDefault();

		const item = this.order.items[this.selectedIndex];
		this.posService.deleteItem(item);
	}

	editItem(item: OrderItem): void {
		this.posService.itemEdit.emit(item);
	}

	private onItemEdit(item: OrderItem): void {
		this.selectedIndex = this.order.items.indexOf(item);
	}

	private onOrderUpdate(order: Order): void {
		const length = this.order.items.length;
		if (this.selectedIndex > 0 && this.selectedIndex >= length) {
			this.selectedIndex = length - 1;
		}

		if (this.order.count === 0) {
			this.generateRandomInfo();
		}
	}

	private generateRandomInfo(): void {
		this.randomInfo = this.infoService.getRandomInfo();
	}

	private scrollItemIntoView(): void {
		const item = this.orderItems.toArray()[this.selectedIndex];

		if (!this.itemInView(item)) {
			item.nativeElement.scrollIntoView(false);
		}
	}

	private itemInView(el: ElementRef): boolean {
		const rect = el.nativeElement.getBoundingClientRect();
		const elemTop = rect.top;
		const elemBottom = rect.bottom;

		// Only completely visible elements return true:
		const isVisible = elemTop >= 0 && elemBottom <= window.innerHeight;
		return isVisible;
	}
}

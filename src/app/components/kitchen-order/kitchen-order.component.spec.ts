import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { KitchenOrderComponent } from './kitchen-order.component';

describe('KitchenOrderComponent', () => {
	let component: KitchenOrderComponent;
	let fixture: ComponentFixture<KitchenOrderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [KitchenOrderComponent]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(KitchenOrderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});

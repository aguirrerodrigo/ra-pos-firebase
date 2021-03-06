import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { environment } from '@src/environments/environment';

import {
	FontAwesomeModule,
	FaIconLibrary
} from '@fortawesome/angular-fontawesome';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

import { AppComponent } from './app.component';
import { PosPageComponent } from './components/pos-page/pos-page.component';

import { OrderComponent } from './components/order/order.component';
import { OrderItemComponent } from './components/order-item/order-item.component';
import { SearchComponent } from './components/search/search.component';
import { MenuSearchComponent } from './components/menu-search/menu-search.component';
import { AddItemSearchComponent } from './components/add-item-search/add-item-search.component';
import { OrderItemEditComponent } from './components/order-item-edit/order-item-edit.component';
import { NumberInputComponent } from './components/number-input/number-input.component';
import { PaymentComponent } from './components/payment/payment.component';

import { AutoTypeDirective } from './directives/auto-type.directive';
import { ScrollIntoViewDirective } from './directives/scroll-into-view.directive';
import { SelectOnFocusDirective } from './directives/select-on-focus.directive';

import { PhpCurrencyPipe } from './pipes/php-currency.pipe';

import { ServiceWorkerModule } from '@angular/service-worker';
import { AngularFireModule } from '@angular/fire';
import { AngularFireAnalyticsModule } from '@angular/fire/analytics';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { KitchenPageComponent } from './components/kitchen-page/kitchen-page.component';
import { KitchenOrderComponent } from './components/kitchen-order/kitchen-order.component';

@NgModule({
	declarations: [
		PosPageComponent,

		AppComponent,
		OrderComponent,
		OrderItemComponent,
		SearchComponent,
		AddItemSearchComponent,
		MenuSearchComponent,
		OrderItemEditComponent,
		NumberInputComponent,
		PaymentComponent,

		AutoTypeDirective,
		ScrollIntoViewDirective,
		SelectOnFocusDirective,

		PhpCurrencyPipe,

		KitchenPageComponent,

		KitchenOrderComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		NgbModule,
		FontAwesomeModule,
		ServiceWorkerModule.register('ngsw-worker.js', {
			enabled: environment.production
		}),
		AngularFireModule.initializeApp(environment.firebase),
		AngularFireAnalyticsModule,
		AngularFireDatabaseModule,
		AngularFirestoreModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(faIconLibrary: FaIconLibrary) {
		faIconLibrary.addIconPacks(far, fas);
	}
}

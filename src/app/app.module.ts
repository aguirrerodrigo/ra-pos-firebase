import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OrderComponent } from './components/order/order.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SearchComponent } from './components/search/search.component';
import { OrderSearchComponent } from './components/order-search/order-search.component';
import { AutoTypeDirective } from './directives/auto-type.directive';

@NgModule({
   declarations: [
      AppComponent,
      OrderComponent,
      SearchComponent,
      OrderSearchComponent,
      AutoTypeDirective
   ],
   imports: [BrowserModule, AppRoutingModule, NgbModule],
   providers: [],
   bootstrap: [AppComponent]
})
export class AppModule {}

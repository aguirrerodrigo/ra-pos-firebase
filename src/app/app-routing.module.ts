import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PosPageComponent } from './components/pos-page/pos-page.component';
import { KitchenPageComponent } from './components/kitchen-page/kitchen-page.component';

const routes: Routes = [
	{ path: 'pos/:posId', component: PosPageComponent },
	{ path: 'kitchen', component: KitchenPageComponent },
	{ path: '**', redirectTo: '/pos/1' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}

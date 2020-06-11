import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PosPageComponent } from './components/pos-page/pos-page.component';

const routes: Routes = [
	{ path: 'pos/:posId', component: PosPageComponent },
	{ path: '**', redirectTo: '/pos/1' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule]
})
export class AppRoutingModule {}

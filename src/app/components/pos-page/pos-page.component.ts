import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PageService } from '@app/services/page.service';
import { PosService } from '@app/services/pos.service';

@Component({
	selector: 'app-pos-page',
	templateUrl: './pos-page.component.html',
	styleUrls: ['./pos-page.component.scss']
})
export class PosPageComponent {
	constructor(
		private route: ActivatedRoute,
		private posSerivce: PosService,
		private pageService: PageService
	) {
		const id = this.route.snapshot.paramMap.get('posId');
		this.posSerivce.init(id);
		this.pageService.pageTitle = 'POS ' + id;
		this.pageService.windowTitle = 'POS ' + id;
	}
}

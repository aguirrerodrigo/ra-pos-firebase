import { Component } from '@angular/core';
import Package from '@root/package.json';
import { PageService } from '@app/services/page.service';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	version = Package.version;
	title = 'POS';

	constructor(private pageService: PageService) {
		this.pageService.pageTitleChange.subscribe(
			() => (this.title = this.pageService.pageTitle)
		);
	}
}

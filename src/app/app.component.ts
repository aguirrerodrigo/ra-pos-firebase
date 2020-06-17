import { Component } from '@angular/core';
import Package from '@root/package.json';
import { PageService } from '@app/services/page.service';
import Settings from '@src/assets/json/settings.json';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent {
	devices: { name: string; url: string }[] = [];
	version = Package.version;
	title = 'POS';
	showNavMenu = false;

	constructor(private pageService: PageService) {
		this.pageService.pageTitleChange.subscribe(
			() => (this.title = this.pageService.pageTitle)
		);

		this.setDevices();
	}

	private setDevices(): void {
		const buffer = [];

		for (const key in Settings.pos.devices) {
			if (Settings.pos.devices.hasOwnProperty(key)) {
				buffer.push({ name: key, url: Settings.pos.devices[key] });
			}
		}
		this.devices = buffer;
	}
}

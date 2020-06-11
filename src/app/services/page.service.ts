import { Injectable, EventEmitter } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
	providedIn: 'root'
})
export class PageService {
	private _pageTitle = 'POS';
	private _windowTitle = 'POS';
	readonly pageTitleChange = new EventEmitter();
	readonly windowTitleChange = new EventEmitter();

	get pageTitle(): string {
		return this._pageTitle;
	}

	set pageTitle(value: string) {
		this._pageTitle = value;
		this.pageTitleChange.emit();
	}

	get windowTitle(): string {
		return this._windowTitle;
	}

	set windowTitle(value: string) {
		this._windowTitle = value;
		this.titleService.setTitle(this._windowTitle);
		this.windowTitleChange.emit();
	}

	constructor(private titleService: Title) {
		this.titleService.setTitle(this._windowTitle);
	}
}

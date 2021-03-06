import {
	Component,
	Input,
	Output,
	ContentChild,
	TemplateRef,
	EventEmitter,
	ViewChild,
	ElementRef
} from '@angular/core';
import { SearchItem } from './models/search-item';
import { TextStartsStrategy } from './models/text-starts-strategy';
import { WordStartsStrategy } from './models/word-starts-strategy';
import { AcronymStrategy } from './models/acronym-strategy';
import { SearchResultItem } from './models/search-result-item';

@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.scss']
})
export class SearchComponent {
	private _search = '';
	private buffer = new Set<SearchItem>();
	private _result: SearchResultItem[] = [];
	private _items: SearchItem[] = [];
	selectedIndex = 0;

	get result(): SearchResultItem[] {
		return this._result;
	}

	set result(value: SearchResultItem[]) {
		this._result = value;
	}

	get search(): string {
		return this._search;
	}

	set search(value: string) {
		this._search = value;

		if (!this.items) return;
		if (!this.searchStrategies) return;

		const search = this.leftTrim(value);
		this.buffer.clear();
		if (search) {
			for (const strategy of this.searchStrategies) {
				for (const item of this.items) {
					if (this.buffer.has(item)) continue;

					if (item.match(search, strategy, this.caseSensitive)) {
						this.buffer.add(item);
					}
				}
			}
		}
		this.result = this.createResult(this.buffer);
		this.selectedIndex = 0;
	}

	@ViewChild('searchInput') searchElement: ElementRef;
	@ContentChild(TemplateRef) searchResultTemplate: TemplateRef<
		SearchResultItem
	>;

	@Input() searchStrategies = [
		new TextStartsStrategy(),
		new WordStartsStrategy(),
		new AcronymStrategy()
	];
	@Input() placeholder = 'Search';
	@Input() caseSensitive = false;

	get items(): SearchItem[] {
		return this._items;
	}

	@Input() set items(value: SearchItem[]) {
		const doSearch = !this._items;

		this._items = value;
		if (doSearch) {
			this.search = this.search;
		}
	}

	@Output() readonly itemSelect = new EventEmitter<SearchResultItem>();

	onArrowDownKey(e: Event): void {
		e.preventDefault();

		if (this.selectedIndex < this.result.length - 1) {
			this.selectedIndex++;
		}
	}

	onArrowUpKey(e: Event): void {
		e.preventDefault();

		if (this.selectedIndex > 0) {
			this.selectedIndex--;
		}
	}

	onEnterKey(e: Event): void {
		e.preventDefault();

		if (!this.result || this.result.length === 0) return;

		this.itemSelect.emit(this.result[this.selectedIndex]);
		this.search = '';
	}

	onEscKey(e: Event): void {
		e.preventDefault();

		(e.target as HTMLInputElement).value = '';
		this.search = '';
	}

	onItemClick(item: SearchResultItem): void {
		this.itemSelect.emit(item);
		this.search = '';
		this.searchElement.nativeElement.focus();
	}

	focus(): void {
		this.searchElement.nativeElement.focus();
	}

	clear(): void {
		this.search = '';
		this.focus();
	}

	private createResult(items: Set<SearchItem>): SearchResultItem[] {
		const result: SearchResultItem[] = [];
		for (const item of items) {
			result.push({
				display: item.formattedText,
				model: item.model
			});
		}

		return result;
	}

	private leftTrim(s: string): string {
		if (!s) return s;

		let index = 0;
		while (index < s.length && s[index] === ' ') {
			index++;
		}
		return s.substr(index);
	}
}

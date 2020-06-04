import { Injectable, EventEmitter } from '@angular/core';
import { MenuItem } from '@app/models/menu-item';
import { AngularFireDatabase } from '@angular/fire/database';

@Injectable({
	providedIn: 'root'
})
export class MenuService {
	menu: MenuItem[];
	readonly menuChange = new EventEmitter();

	constructor(db: AngularFireDatabase) {
		db.list<MenuItem>('menu')
			.valueChanges()
			.subscribe((menu: MenuItem[]) => {
				this.menu = menu;
				this.menuChange.emit();
			});
	}
}

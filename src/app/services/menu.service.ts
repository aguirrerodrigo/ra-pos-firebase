import { Injectable } from '@angular/core';
import { MenuItem } from '@app/models/menu-item';
import Menu from '@src/assets/json/menu.json';

@Injectable({
	providedIn: 'root'
})
export class MenuService {
	menu: MenuItem[] = Menu;
}

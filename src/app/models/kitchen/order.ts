import { OrderItem } from './order-item';
import moment from 'moment';

export class Order {
	id: any = 0;
	startDate = new Date();
	items: OrderItem[] = [];
}

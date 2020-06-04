import { formatCurrency } from '@angular/common';

export function formatPhpCurrency(n: number): string {
	return formatCurrency(n, 'en-PH', 'P ', 'PHP', '1.2-2');
}

export function isNullOrWhiteSpace(s: string): boolean {
	return s == null || s.trim().length === 0;
}

export function keep(obj: any): void {
	obj.__keep = true;
}

export function isKeep(obj: any): boolean {
	return obj.__keep === true;
}

export function clearKeep(obj: any): void {
	obj.__keep = undefined;
}

export function key(...args: any[]): string {
	return args.join('::').toLowerCase();
}

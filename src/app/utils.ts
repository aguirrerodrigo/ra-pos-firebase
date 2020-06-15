import { formatCurrency, formatDate } from '@angular/common';
import { Constants } from './constants';

export class Format {
	static phpCurrency(n: number): string {
		return formatCurrency(
			n,
			Constants.locale,
			'P ',
			Constants.currencyCode,
			'1.2-2'
		);
	}

	static date(date: Date): string {
		return formatDate(date, Constants.dateFormat, Constants.locale);
	}

	static dateTime(date: Date): string {
		return formatDate(date, Constants.dateTimeFormat, Constants.locale);
	}

	static time(date: Date): string {
		return formatDate(date, Constants.timeFormat, Constants.locale);
	}

	static duration(date: Date): string {
		return formatDate(date, Constants.timeFormat, Constants.locale, 'UTC');
	}
}

export class Str {
	static isNullOrWhiteSpace(s: string): boolean {
		return s == null || s.trim().length === 0;
	}
}

export class Data {
	static readonly skipMerge = new Object();

	static keep(obj: any): void {
		obj.__keep = true;
	}

	static isKeep(obj: any): boolean {
		return obj.__keep === true;
	}

	static clearKeep(obj: any): void {
		delete obj.__keep;
	}

	static key(...args: any[]): string {
		return args.join('::').toLowerCase();
	}

	static merge(ref: any, data: any, options: any = {}): boolean {
		if (data == null) return false;

		let dirty = false;
		for (const k of Object.keys(data)) {
			if (options[k] !== this.skipMerge) {
				let value = data[k];
				if (options[k] instanceof Function) {
					value = options[k](value);
					if (ref[k] !== value) {
						ref[k] = value;
						dirty = true;
					}
				} else {
					value =
						options[k] && options[k].converter
							? options[k].converter(value)
							: value;
					if (
						options[k] && options[k].equality
							? !options[k].equality(ref[k], value)
							: ref[k] !== value
					) {
						ref[k] = value;
						dirty = true;
					}
				}
			}
		}

		return dirty;
	}
}

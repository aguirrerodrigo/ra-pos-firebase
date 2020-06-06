import { Pipe, PipeTransform } from '@angular/core';
import { Format } from '@app/utils';

@Pipe({
	name: 'php'
})
export class PhpCurrencyPipe implements PipeTransform {
	transform(value: number): string {
		return Format.phpCurrency(value);
	}
}

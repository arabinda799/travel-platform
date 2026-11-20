import { Pipe, PipeTransform } from '@angular/core';
import { truncateText } from '../utils/string-truncate';

@Pipe({
  name: 'truncate',
  standalone: true,
})
export class TruncatePipe implements PipeTransform {
  transform(value: unknown, limit = 30): string {
    return truncateText(value, limit);
  }
}

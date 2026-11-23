import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-skeleton',
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoaderComponent {
  readonly variant = input<'table' | 'form' | 'card' | 'line'>('table');
  readonly rows = input<number>(5);
  readonly columns = input<number>(4);

  get rowArray(): number[] {
    return Array.from({ length: this.rows() });
  }

  get colArray(): number[] {
    return Array.from({ length: this.columns() });
  }
}

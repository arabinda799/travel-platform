import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { BreadcrumbItem } from '../../interfaces/breadcrumb-item';
import { SkeletonLoaderComponent } from '../skeleton-loader/skeleton-loader';

@Component({
  selector: 'lib-page-container',
  imports: [RouterLink, SkeletonLoaderComponent],
  templateUrl: './page-container.html',
  styleUrl: './page-container.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageContainerComponent {
  readonly title = input.required<string>();
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly breadcrumbs = input<BreadcrumbItem[]>([]);
  readonly variant = input<'list' | 'form' | 'default'>('default');
  readonly flush = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly skeletonRows = input<number>(5);
  readonly skeletonColumns = input<number>(4);
}

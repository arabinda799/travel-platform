import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type StatusBadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'muted' | 'primary' | 'auto';
export type StatusBadgeSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-status-badge',
  standalone: true,
  imports: [],
  templateUrl: './status-badge.html',
  styleUrl: './status-badge.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatusBadgeComponent {
  /** The raw status string (e.g. 'Active', 'Inactive', 'Confirmed', 'Pending') */
  readonly status = input<string>('');

  /** Explicit variant or 'auto' to infer from status name */
  readonly variant = input<StatusBadgeVariant>('auto');

  /** Visual badge size */
  readonly size = input<StatusBadgeSize>('md');

  /** Whether to show the glowing status dot on the left */
  readonly dot = input<boolean>(true);

  /** Optional leading icon name (Material Symbols) */
  readonly icon = input<string>('');

  /** Custom display label (defaults to status input) */
  readonly label = input<string>('');

  readonly displayLabel = computed(() => {
    return this.label() || this.status();
  });

  readonly computedVariant = computed<string>(() => {
    const v = this.variant();
    if (v !== 'auto') {
      return v;
    }

    const s = (this.status() || '').toLowerCase().trim();
    switch (s) {
      case 'active':
      case 'confirmed':
      case 'ticketed':
      case 'approved':
      case 'success':
      case 'successful':
      case 'vouchered':
      case 'completed':
      case 'published':
      case 'enabled':
      case 'paid':
        return 'success';

      case 'pending':
      case 'in progress':
      case 'processing':
      case 'draft':
      case 'waiting':
      case 'partial':
      case 'partially paid':
        return 'warning';

      case 'inactive':
      case 'cancelled':
      case 'rejected':
      case 'failed':
      case 'blocked':
      case 'deleted':
      case 'disabled':
      case 'refunded':
        return 'danger';

      case 'checked in':
      case 'info':
      case 'new':
      case 'open':
        return 'info';

      case 'checked out':
      case 'archived':
      case 'closed':
      case 'muted':
        return 'muted';

      default:
        return 'info';
    }
  });
}

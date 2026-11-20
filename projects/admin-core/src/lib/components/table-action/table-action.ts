import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TooltipModule } from 'primeng/tooltip';

export type TableActionType =
  | 'view'
  | 'edit'
  | 'download'
  | 'duplicate'
  | 'change_status'
  | 'delete'
  | 'cancel'
  | 'approve'
  | 'reject'
  | 'custom';

export type TableActionColor = 'neutral' | 'red' | 'green' | 'auto';
export type TableActionSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-table-action',
  standalone: true,
  imports: [TooltipModule],
  templateUrl: './table-action.html',
  styleUrl: './table-action.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TableActionComponent {
  /** The standard action type according to design convention */
  readonly action = input<TableActionType>('custom');

  /** Optional override for the icon (defaults to action standard) */
  readonly icon = input<string>('');

  /** Color override or 'auto' to adhere to convention table */
  readonly color = input<TableActionColor>('auto');

  /** Tooltip label (defaults to capitalized action name) */
  readonly tooltip = input<string>('');

  /** Button size */
  readonly size = input<TableActionSize>('md');

  /** Disabled state */
  readonly disabled = input<boolean>(false);

  /** Click event output */
  readonly clicked = output<MouseEvent>();

  readonly defaultTooltip = computed(() => {
    switch (this.action()) {
      case 'view':
        return 'View Details';
      case 'edit':
        return 'Edit';
      case 'download':
        return 'Download';
      case 'duplicate':
        return 'Duplicate';
      case 'change_status':
        return 'Change Status';
      case 'delete':
        return 'Delete';
      case 'cancel':
        return 'Cancel Booking';
      case 'approve':
        return 'Approve';
      case 'reject':
        return 'Reject';
      default:
        return '';
    }
  });

  readonly effectiveIcon = computed(() => {
    if (this.icon()) {
      return this.icon();
    }
    switch (this.action()) {
      case 'view':
        return 'visibility';
      case 'edit':
        return 'edit_square'; // Boxed pencil
      case 'download':
        return 'download';
      case 'duplicate':
        return 'content_copy';
      case 'change_status':
        return 'sync';
      case 'delete':
        return 'delete';
      case 'cancel':
        return 'cancel';
      case 'approve':
        return 'check_circle';
      case 'reject':
        return 'cancel';
      default:
        return 'more_horiz';
    }
  });

  readonly computedColor = computed<'neutral' | 'red' | 'green'>(() => {
    const c = this.color();
    if (c !== 'auto') {
      return c;
    }
    switch (this.action()) {
      // Destructive & Negative actions -> Red
      case 'delete':
      case 'cancel':
      case 'reject':
        return 'red';

      // Positive actions -> Green
      case 'approve':
        return 'green';

      // Standard actions -> Neutral / Grey
      case 'view':
      case 'edit':
      case 'download':
      case 'duplicate':
      case 'change_status':
      default:
        return 'neutral';
    }
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.clicked.emit(event);
  }
}

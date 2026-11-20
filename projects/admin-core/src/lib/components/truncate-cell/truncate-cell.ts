import { Component, computed, input } from '@angular/core';
import { Tooltip } from 'primeng/tooltip';
import { shouldTruncate, truncateText, getTruncateTooltip } from '../../utils/string-truncate';

/**
 * Common reusable component to render text truncated with an ellipsis
 * and a tooltip on hover when exceeding the character limit (default 30).
 */
@Component({
  selector: 'lib-truncate-cell',
  standalone: true,
  imports: [Tooltip],
  template: `
    @if (isTruncated()) {
      <span
        class="cell-truncated"
        [pTooltip]="fullText()"
        tooltipPosition="top"
        [showDelay]="150"
        tooltipStyleClass="app-table-tooltip">
        {{ displayText() }}
      </span>
    } @else {
      <span>{{ fullText() }}</span>
    }
  `,
  styles: [`
    :host {
      display: inline-block;
      max-width: 100%;
      vertical-align: middle;
    }

    .cell-truncated {
      display: inline-block;
      max-width: 100%;
      cursor: help;
      text-decoration: underline dotted var(--border-hover, rgba(255, 255, 255, 0.35));
      text-underline-offset: 0.2rem;
      transition: color 0.15s, text-decoration-color 0.15s;

      &:hover {
        color: var(--accent, #FF5722);
        text-decoration-color: var(--accent, #FF5722);
      }
    }
  `],
})
export class TruncateCellComponent {
  readonly value = input<unknown>('');
  readonly limit = input<number>(30);

  readonly fullText = computed(() => getTruncateTooltip(this.value()));
  readonly isTruncated = computed(() => shouldTruncate(this.fullText(), this.limit()));
  readonly displayText = computed(() => truncateText(this.fullText(), this.limit()));
}

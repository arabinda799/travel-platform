import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'
  | 'outline'
  | 'outline-primary'
  | 'outline-info'
  | 'outline-warning'
  | 'outline-danger'
  | 'outline-secondary'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'lib-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly icon = input<string>('');
  readonly iconPos = input<'left' | 'right'>('left');
  readonly outlined = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly badge = input<string | number>('');
  readonly dropdown = input<boolean>(false);
  readonly title = input<string>('');

  readonly btnClick = output<MouseEvent>();

  readonly buttonClasses = computed(() => {
    let v = this.variant();
    if (this.outlined() && !v.startsWith('outline')) {
      v = `outline-${v}` as ButtonVariant;
    }
    return `btn btn-${v} btn-${this.size()}`;
  });

  handleClick(event: MouseEvent): void {
    if (this.disabled() || this.loading()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.btnClick.emit(event);
  }
}

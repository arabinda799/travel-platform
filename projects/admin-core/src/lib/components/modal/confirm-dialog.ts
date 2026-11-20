import { Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent, ButtonVariant } from '../button/button';
import { ModalHeaderComponent } from './modal-header/modal-header';

@Component({
  selector: 'lib-confirm-dialog',
  imports: [DialogModule, ButtonComponent, ModalHeaderComponent],
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialogComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('Confirm Action');
  readonly message = input<string>('Are you sure you want to proceed? This action cannot be undone.');
  readonly icon = input<string>('warning');
  readonly confirmLabel = input<string>('Delete');
  readonly cancelLabel = input<string>('Cancel');
  readonly confirmVariant = input<ButtonVariant>('danger');
  readonly count = input<number>(0);

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit();
    this.visible.set(false);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }
}

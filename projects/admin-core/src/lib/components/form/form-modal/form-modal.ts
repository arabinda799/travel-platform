import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent, ButtonVariant } from '../../button/button';
import { ModalHeaderComponent } from '../../modal/modal-header/modal-header';

@Component({
  selector: 'lib-form-modal',
  standalone: true,
  imports: [DialogModule, ButtonComponent, FormsModule, ModalHeaderComponent],
  templateUrl: './form-modal.html',
  styleUrl: './form-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormModalComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('Form');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('edit_document');
  readonly width = input<string>('42rem');
  readonly modal = input<boolean>(true);
  readonly closable = input<boolean>(true);

  readonly submitLabel = input<string>('Save Changes');
  readonly submitIcon = input<string>('check');
  readonly submitVariant = input<ButtonVariant>('primary');
  readonly submitDisabled = input<boolean>(false);
  readonly loading = input<boolean>(false);

  readonly showCancel = input<boolean>(true);
  readonly cancelLabel = input<string>('Cancel');

  readonly submitted = output<Event>();
  readonly cancelled = output<void>();
  readonly closed = output<void>();

  private isSubmitting = false;

  onSubmit(event?: Event | MouseEvent): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (this.isSubmitting || this.submitDisabled() || this.loading()) {
      return;
    }
    this.isSubmitting = true;
    setTimeout(() => {
      this.isSubmitting = false;
    }, 150);
    this.submitted.emit(event ?? new Event('submit'));
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }

  onHide(): void {
    this.closed.emit();
  }
}

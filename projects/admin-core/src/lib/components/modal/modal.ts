import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ModalHeaderComponent } from './modal-header/modal-header';

@Component({
  selector: 'lib-modal',
  imports: [DialogModule, ModalHeaderComponent],
  templateUrl: './modal.html',
  styleUrl: './modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('');
  readonly width = input<string>('28rem');
  readonly modal = input<boolean>(true);
  readonly closable = input<boolean>(true);

  readonly closed = output<void>();

  onHide(): void {
    this.closed.emit();
  }
}

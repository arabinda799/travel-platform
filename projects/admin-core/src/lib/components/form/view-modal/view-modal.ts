import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonComponent } from '../../button/button';
import { ModalHeaderComponent } from '../../modal/modal-header/modal-header';

@Component({
  selector: 'lib-view-modal',
  standalone: true,
  imports: [DialogModule, ButtonComponent, ModalHeaderComponent],
  templateUrl: './view-modal.html',
  styleUrl: './view-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ViewModalComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('Details');
  readonly subtitle = input<string>('');
  readonly icon = input<string>('visibility');
  readonly width = input<string>('38rem');
  readonly modal = input<boolean>(true);
  readonly closable = input<boolean>(true);

  // Circular Hero Section Inputs
  readonly imageUrl = input<string>('');
  readonly imageAlt = input<string>('');
  readonly heroTitle = input<string>('');
  readonly heroSubtitle = input<string>('');
  readonly heroBadge = input<string>('');
  readonly heroBadgeSeverity = input<'success' | 'danger' | 'secondary' | 'info'>('success');

  readonly showEditButton = input<boolean>(false);
  readonly editLabel = input<string>('Edit');
  readonly closeLabel = input<string>('Close');

  readonly edit = output<void>();
  readonly closed = output<void>();

  onEdit(): void {
    this.edit.emit();
  }

  close(): void {
    this.visible.set(false);
    this.closed.emit();
  }

  onHide(): void {
    this.closed.emit();
  }
}

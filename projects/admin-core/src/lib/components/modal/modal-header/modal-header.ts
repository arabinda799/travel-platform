import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'lib-modal-header',
  standalone: true,
  imports: [],
  templateUrl: './modal-header.html',
  styleUrl: './modal-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalHeaderComponent {
  readonly icon = input<string>('');
  readonly title = input<string>('');
  readonly subtitle = input<string>('');
}

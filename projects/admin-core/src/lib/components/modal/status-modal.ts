import { Component, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { ButtonComponent } from '../button/button';

export interface StatusOption {
  label: string;
  value: string;
  description?: string;
  color?: string;
}

@Component({
  selector: 'lib-status-modal',
  imports: [FormsModule, DialogModule, Select, ButtonComponent],
  templateUrl: './status-modal.html',
  styleUrl: './status-modal.scss',
})
export class StatusModalComponent {
  readonly visible = model<boolean>(false);
  readonly title = input<string>('Change Status');
  readonly description = input<string>('Select the new status to apply:');
  readonly count = input<number>(0);
  readonly options = input<StatusOption[]>([
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ]);

  readonly selectedStatus = model<string>('Active');

  readonly confirmed = output<string>();
  readonly cancelled = output<void>();

  onConfirm(): void {
    this.confirmed.emit(this.selectedStatus());
    this.visible.set(false);
  }

  onCancel(): void {
    this.cancelled.emit();
    this.visible.set(false);
  }
}

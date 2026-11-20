import { Component, input, model, output } from '@angular/core';
import { Drawer } from 'primeng/drawer';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'lib-filter-sidebar',
  imports: [Drawer, ButtonComponent],
  templateUrl: './filter-sidebar.html',
  styleUrl: './filter-sidebar.scss',
})
export class FilterSidebarComponent {
  readonly title = input<string>('Filters');
  readonly visible = model<boolean>(false);
  readonly apply = output<void>();
  readonly reset = output<void>();

  onApply(): void {
    this.apply.emit();
    this.visible.set(false);
  }

  onReset(): void {
    this.reset.emit();
  }
}

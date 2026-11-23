import { ChangeDetectionStrategy, Component, inject, Injector, input, model, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';

let nextId = 0;

@Component({
  selector: 'lib-checkbox-field',
  standalone: true,
  imports: [FormsModule, CheckboxModule],
  templateUrl: './checkbox-field.html',
  styleUrl: './checkbox-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldComponent implements ControlValueAccessor, OnInit {
  private readonly injector = inject(Injector);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-checkbox-${++nextId}`);
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly value = model<boolean>(false);

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    try {
      this.ngControl = this.injector.get(NgControl, null, { optional: true, self: true });
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;
      }
    } catch {
      // Standalone usage without NgControl
    }
  }

  get errorMessage(): string {
    if (this.error()) return this.error();
    const ctrl = this.ngControl?.control;
    if (ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched)) {
      if (ctrl.errors?.['required'] || ctrl.errors?.['requiredTrue']) {
        return `${this.label() || 'This field'} is required`;
      }
      return 'Invalid selection';
    }
    return '';
  }

  writeValue(val: any): void {
    this.value.set(Boolean(val));
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onCheckboxChange(val: boolean): void {
    this.value.set(val);
    this.onChange(val);
    this.onTouched();
  }
}

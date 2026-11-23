import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, inject, Injector, input, model, OnInit } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

let nextId = 0;

@Component({
  selector: 'lib-switch-field',
  standalone: true,
  imports: [FormsModule, ToggleSwitchModule],
  templateUrl: './switch-field.html',
  styleUrl: './switch-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchFieldComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-switch-${++nextId}`);
  readonly label = input<string>('');
  readonly description = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly value = model<boolean>(false);

  private onChange: (val: boolean) => void = () => {};
  private onTouched: () => void = () => {};

  private lastControlTouched = false;
  private lastControlDirty = false;
  private lastControlInvalid = false;
  private lastControlValue: any = undefined;

  constructor() {
    try {
      this.ngControl = this.injector.get(NgControl, null, { optional: true, self: true });
      if (this.ngControl) {
        this.ngControl.valueAccessor = this;
      }
    } catch {
      // Standalone usage without NgControl
    }
  }

  ngOnInit(): void {}

  ngDoCheck(): void {
    const ctrl = this.ngControl?.control;
    if (ctrl) {
      if (
        ctrl.touched !== this.lastControlTouched ||
        ctrl.dirty !== this.lastControlDirty ||
        ctrl.invalid !== this.lastControlInvalid ||
        ctrl.value !== this.lastControlValue
      ) {
        this.lastControlTouched = ctrl.touched;
        this.lastControlDirty = ctrl.dirty;
        this.lastControlInvalid = ctrl.invalid;
        this.lastControlValue = ctrl.value;
        this.cdr.markForCheck();
      }
    }
  }

  get errorMessage(): string {
    if (this.error()) return this.error();
    const ctrl = this.ngControl?.control;
    if (ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched)) {
      if (ctrl.errors?.['required']) return `${this.label() || 'This field'} is required`;
      return 'Invalid selection';
    }
    return '';
  }

  writeValue(val: any): void {
    this.value.set(Boolean(val));
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onSwitchChange(val: boolean): void {
    this.value.set(val);
    this.onChange(val);
    this.ngControl?.control?.markAsDirty();
    this.onTouched();
    this.cdr.markForCheck();
  }
}

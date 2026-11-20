import { ChangeDetectorRef, Component, DoCheck, forwardRef, inject, Injector, input, model, OnInit, output, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { FormFieldComponent } from '../form-field/form-field';

let nextId = 0;

@Component({
  selector: 'lib-text-field',
  standalone: true,
  imports: [InputTextModule, FormFieldComponent],
  templateUrl: './text-field.html',
  styleUrl: './text-field.scss',
})
export class TextFieldComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-input-${++nextId}`);
  readonly label = input<string>('');
  readonly type = input<string>('text');
  readonly placeholder = input<string>('');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly prefixIcon = input<string>('');
  readonly suffixIcon = input<string>('');
  readonly clearable = input<boolean>(false);
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly autocomplete = input<string>('off');
  readonly maxlength = input<number | null>(null);

  readonly value = model<string>('');

  readonly blurred = output<void>();

  readonly isTouched = signal<boolean>(false);

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  private lastControlTouched = false;
  private lastControlDirty = false;
  private lastControlInvalid = false;
  private lastControlValue: any = undefined;

  get effectiveControl(): any {
    return this.ngControl?.control ?? null;
  }

  get effectiveValue(): any {
    return this.value() || this.ngControl?.value || '';
  }

  get effectiveTouched(): boolean {
    return this.isTouched() || !!(this.ngControl?.control?.touched) || !!(this.ngControl?.control?.dirty);
  }

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
        if (ctrl.touched && !this.isTouched()) {
          this.isTouched.set(true);
        }
        this.cdr.markForCheck();
      }
    }
  }

  writeValue(val: any): void {
    this.value.set(val ?? '');
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this.value.set(val);
    this.onChange(val);
    if (!this.isTouched()) {
      this.isTouched.set(true);
    }
    this.ngControl?.control?.markAsDirty();
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.isTouched.set(true);
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
    this.onTouched();
    this.cdr.markForCheck();
    this.blurred.emit();
  }

  onClear(): void {
    this.value.set('');
    this.onChange('');
    this.isTouched.set(true);
    this.ngControl?.control?.markAsDirty();
    this.ngControl?.control?.markAsTouched();
    this.onTouched();
    this.cdr.markForCheck();
  }
}

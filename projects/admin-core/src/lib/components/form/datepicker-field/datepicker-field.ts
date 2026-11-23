import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, inject, Injector, input, model, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NgControl } from '@angular/forms';
import { DatePickerModule } from 'primeng/datepicker';
import { FormFieldComponent } from '../form-field/form-field';

let nextId = 0;

@Component({
  selector: 'lib-datepicker-field',
  standalone: true,
  imports: [FormsModule, DatePickerModule, FormFieldComponent],
  templateUrl: './datepicker-field.html',
  styleUrl: './datepicker-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DatePickerFieldComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-date-${++nextId}`);
  readonly label = input<string>('');
  readonly placeholder = input<string>('Select date');
  readonly selectionMode = input<'single' | 'multiple' | 'range'>('single');
  readonly dateFormat = input<string>('dd/mm/yy');
  readonly showIcon = input<boolean>(true);
  readonly showButtonBar = input<boolean>(true);
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly appendTo = input<any>('body');

  readonly value = model<any>(null);

  readonly isTouched = signal<boolean>(false);

  private onChange: (val: any) => void = () => {};
  private onTouched: () => void = () => {};

  private lastControlTouched = false;
  private lastControlDirty = false;
  private lastControlInvalid = false;
  private lastControlValue: any = undefined;

  get effectiveControl(): any {
    return this.ngControl?.control ?? null;
  }

  get effectiveValue(): any {
    return this.value() ?? this.ngControl?.value ?? null;
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
    this.value.set(val);
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onDateChange(val: any): void {
    this.value.set(val);
    this.onChange(val);
    this.isTouched.set(true);
    this.ngControl?.control?.markAsDirty();
    this.onTouched();
    this.cdr.markForCheck();
  }

  onBlur(): void {
    this.isTouched.set(true);
    this.ngControl?.control?.markAsTouched();
    this.onTouched();
    this.cdr.markForCheck();
  }
}

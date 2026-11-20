import { ChangeDetectorRef, Component, DoCheck, forwardRef, inject, Injector, input, model, OnInit, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, NgControl } from '@angular/forms';
import { TextareaModule } from 'primeng/textarea';
import { FormFieldComponent } from '../form-field/form-field';

let nextId = 0;

@Component({
  selector: 'lib-textarea-field',
  standalone: true,
  imports: [TextareaModule, FormFieldComponent],
  templateUrl: './textarea-field.html',
  styleUrl: './textarea-field.scss',
})
export class TextareaFieldComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-textarea-${++nextId}`);
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly rows = input<number>(3);
  readonly cols = input<number>(30);
  readonly autoResize = input<boolean>(false);
  readonly maxlength = input<number | null>(null);
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly readonly = input<boolean>(false);
  readonly disabled = input<boolean>(false);

  readonly value = model<string>('');

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
    const val = (event.target as HTMLTextAreaElement).value;
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
  }
}

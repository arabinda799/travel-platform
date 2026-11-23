import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DoCheck, inject, Injector, input, model, OnInit, output, signal } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';
import { FormFieldComponent } from '../form-field/form-field';

let nextId = 0;

@Component({
  selector: 'lib-file-upload-field',
  standalone: true,
  imports: [FormFieldComponent],
  templateUrl: './file-upload-field.html',
  styleUrl: './file-upload-field.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FileUploadFieldComponent implements ControlValueAccessor, OnInit, DoCheck {
  private readonly injector = inject(Injector);
  private readonly cdr = inject(ChangeDetectorRef);
  ngControl: NgControl | null = null;

  readonly inputId = input<string>(`lib-file-${++nextId}`);
  readonly label = input<string>('');
  readonly accept = input<string>('image/*');
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly disabled = input<boolean>(false);
  readonly clearable = input<boolean>(true);

  // Model holds the value (string dataURL or file url)
  readonly value = model<string>('');
  readonly fileName = model<string>('');
  readonly previewUrl = model<string>('');

  readonly fileChanged = output<File | null>();

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
    const str = val ?? '';
    this.value.set(str);
    this.previewUrl.set(str);
    if (str && !this.fileName()) {
      const parts = str.split('/');
      this.fileName.set(parts[parts.length - 1].split('?')[0] || 'Image uploaded');
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  onFileSelected(event: Event): void {
    this.isTouched.set(true);
    this.ngControl?.control?.markAsTouched();
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName.set(file.name);

      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        this.value.set(result);
        this.previewUrl.set(result);
        this.onChange(result);
        this.ngControl?.control?.markAsDirty();
        this.onTouched();
        this.cdr.markForCheck();
        this.fileChanged.emit(file);
      };
      reader.readAsDataURL(file);
    }
  }

  onClear(): void {
    this.isTouched.set(true);
    this.value.set('');
    this.fileName.set('');
    this.previewUrl.set('');
    this.onChange('');
    this.ngControl?.control?.markAsDirty();
    this.ngControl?.control?.markAsTouched();
    this.onTouched();
    this.cdr.markForCheck();
    this.fileChanged.emit(null);
  }
}

import { ChangeDetectionStrategy, Component, computed, DoCheck, input, signal, ViewEncapsulation } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';

@Component({
  selector: 'lib-form-field',
  standalone: true,
  imports: [],
  templateUrl: './form-field.html',
  styleUrl: './form-field.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormFieldComponent implements DoCheck {
  readonly label = input<string>('');
  readonly forId = input<string>('');
  readonly required = input<boolean>(false);
  readonly optional = input<boolean>(false);
  readonly hint = input<string>('');
  readonly error = input<string>('');
  readonly disabled = input<boolean>(false);

  /** Optional reactive control binding for automated validation extraction */
  readonly control = input<AbstractControl | null>(null);

  /** Standalone value and touched/dirty state for automated required validation without ReactiveForms */
  readonly value = input<any>(undefined);
  readonly touched = input<boolean>(false);
  readonly dirty = input<boolean>(false);

  private readonly controlUpdate = signal(0);
  private lastTouched = false;
  private lastDirty = false;
  private lastInvalid = false;
  private lastValue: any = undefined;

  ngDoCheck(): void {
    const ctrl = this.control();
    if (ctrl) {
      if (
        ctrl.touched !== this.lastTouched ||
        ctrl.dirty !== this.lastDirty ||
        ctrl.invalid !== this.lastInvalid ||
        ctrl.value !== this.lastValue
      ) {
        this.lastTouched = ctrl.touched;
        this.lastDirty = ctrl.dirty;
        this.lastInvalid = ctrl.invalid;
        this.lastValue = ctrl.value;
        this.controlUpdate.update(n => n + 1);
      }
    }
  }

  readonly isRequired = computed(() => {
    this.controlUpdate();
    if (this.required()) return true;
    const ctrl = this.control();
    return !!(ctrl && typeof ctrl.hasValidator === 'function' && ctrl.hasValidator(Validators.required));
  });

  readonly isValueEmpty = computed(() => {
    this.controlUpdate();
    const ctrl = this.control();
    const val = ctrl ? ctrl.value : this.value();
    if (val === undefined || val === null) return true;
    if (typeof val === 'string' && val.trim() === '') return true;
    if (Array.isArray(val) && val.length === 0) return true;
    return false;
  });

  readonly hasError = computed(() => {
    this.controlUpdate();

    // 1. Explicit error passed from parent
    if (this.error()) return true;

    // 2. Check if field is touched (either via signal input or control)
    const ctrl = this.control();
    const isTouched = this.touched() || this.dirty() || !!(ctrl && (ctrl.touched || ctrl.dirty));

    // 3. Automated standalone or reactive required validation on focus out / touch
    if (this.isRequired() && isTouched && this.isValueEmpty()) {
      return true;
    }

    // 4. Reactive control validation (e.g. invalid format, email, minlength, etc.)
    if (ctrl && isTouched && ctrl.invalid) {
      return true;
    }

    return false;
  });

  readonly errorMessage = computed(() => {
    this.controlUpdate();

    // 1. Explicit error passed from parent
    if (this.error()) return this.error();

    const ctrl = this.control();
    const isTouched = this.touched() || this.dirty() || !!(ctrl && (ctrl.touched || ctrl.dirty));

    // 2. Reactive forms control errors
    if (ctrl && ctrl.errors && isTouched) {
      const errors = ctrl.errors;
      if (errors['required']) return `${this.label() || 'This field'} is required`;
      if (errors['email']) return 'Please enter a valid email address';
      if (errors['minlength']) {
        return `Minimum length is ${errors['minlength'].requiredLength} characters`;
      }
      if (errors['maxlength']) {
        return `Maximum length is ${errors['maxlength'].requiredLength} characters`;
      }
      if (errors['min']) return `Minimum value is ${errors['min'].min}`;
      if (errors['max']) return `Maximum value is ${errors['max'].max}`;
      if (errors['pattern']) return 'Invalid format';

      return 'Invalid value';
    }

    // 3. Automated standalone required validation
    if (this.isRequired() && isTouched && this.isValueEmpty()) {
      return `${this.label() || 'This field'} is required`;
    }

    return '';
  });
}

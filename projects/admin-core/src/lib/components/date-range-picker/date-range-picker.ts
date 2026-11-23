import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  OnInit,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Popover, PopoverModule } from 'primeng/popover';
import { DatePickerModule } from 'primeng/datepicker';
import { ButtonComponent } from '../button/button';
import {
  DATE_RANGE_PRESETS,
  DateRangePreset,
  DateRangePresetId,
  DateRangeSelection,
  formatDisplayDate,
  formatRangeString,
} from './date-range-preset';

@Component({
  selector: 'lib-date-range-picker',
  standalone: true,
  imports: [FormsModule, PopoverModule, DatePickerModule, ButtonComponent],
  templateUrl: './date-range-picker.html',
  styleUrl: './date-range-picker.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DateRangePickerComponent),
      multi: true,
    },
  ],
})
export class DateRangePickerComponent implements ControlValueAccessor, OnInit {
  readonly popover = viewChild<Popover>('op');

  // Inputs & Models
  readonly placeholder = input<string>('Select date range');
  readonly disabled = input<boolean>(false);
  readonly clearable = input<boolean>(true);
  readonly showIcon = input<boolean>(true);
  readonly appendTo = input<any>('body');
  readonly defaultPreset = input<DateRangePresetId | null>(null);

  // Two-way bound models
  readonly value = model<[Date, Date] | null>(null);
  readonly preset = model<string | null>(null);

  // Outputs
  readonly rangeChange = output<DateRangeSelection>();
  readonly clear = output<void>();

  // Internal state
  readonly presets = DATE_RANGE_PRESETS;
  readonly activePresetId = signal<DateRangePresetId | null>(null);
  readonly activePresetLabel = signal<string>('');
  readonly isCustomMode = signal<boolean>(false);
  readonly customRangeDates = signal<Date[] | null>(null);
  readonly isOpen = signal<boolean>(false);

  // Display texts
  readonly formattedRangeText = computed(() => {
    const val = this.value();
    if (!val || !val[0] || !val[1]) return '';
    return formatRangeString(val[0], val[1]);
  });

  readonly customSelectedPreview = computed(() => {
    const dates = this.customRangeDates();
    if (!dates || dates.length === 0 || !dates[0]) return 'Click two dates to select range';
    if (dates.length === 1 || !dates[1]) return `Start: ${formatDisplayDate(dates[0])} (select end date)`;
    return `${formatDisplayDate(dates[0])} - ${formatDisplayDate(dates[1])}`;
  });

  readonly isCustomRangeValid = computed(() => {
    const dates = this.customRangeDates();
    return !!(dates && dates.length === 2 && dates[0] && dates[1]);
  });

  // ControlValueAccessor callbacks
  private onChange: (val: [Date, Date] | null) => void = () => {};
  private onTouched: () => void = () => {};

  ngOnInit(): void {
    const currentVal = this.value();
    if (!currentVal) {
      const def = this.defaultPreset();
      if (def) {
        const found = this.presets.find(p => p.id === def);
        if (found && found.id !== 'custom') {
          const [start, end] = found.calculate();
          this.applySelection(found.id, found.label, start, end);
        }
      }
    } else {
      this.syncActivePresetFromValue(currentVal);
    }
  }

  writeValue(val: [Date, Date] | null): void {
    this.value.set(val);
    if (!val) {
      const def = this.defaultPreset();
      if (def) {
        const found = this.presets.find(p => p.id === def);
        if (found && found.id !== 'custom') {
          const [start, end] = found.calculate();
          this.applySelection(found.id, found.label, start, end);
          return;
        }
      }
      this.activePresetId.set(null);
      this.activePresetLabel.set('');
    } else {
      this.syncActivePresetFromValue(val);
    }
  }

  private syncActivePresetFromValue(val: [Date, Date] | null): void {
    if (!val || !val[0] || !val[1]) return;
    const startStr = formatDisplayDate(val[0]);
    const endStr = formatDisplayDate(val[1]);
    for (const p of this.presets) {
      if (p.id !== 'custom') {
        const [ps, pe] = p.calculate();
        if (formatDisplayDate(ps) === startStr && formatDisplayDate(pe) === endStr) {
          this.activePresetId.set(p.id);
          this.activePresetLabel.set(p.label);
          this.preset.set(p.label);
          return;
        }
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    // Handled via disabled input signal
  }

  onTriggerClick(event: Event): void {
    if (this.disabled()) return;
    this.isCustomMode.set(false);
    this.popover()?.toggle(event);
  }

  onPopoverShow(): void {
    this.isOpen.set(true);
    this.isCustomMode.set(false);
  }

  onPopoverHide(): void {
    this.isOpen.set(false);
    this.isCustomMode.set(false);
    this.onTouched();
  }

  onSelectPreset(preset: DateRangePreset): void {
    if (preset.id === 'custom') {
      // Switch into Custom Range Calendar View
      this.isCustomMode.set(true);
      const current = this.value();
      if (current && current[0] && current[1]) {
        this.customRangeDates.set([new Date(current[0]), new Date(current[1])]);
      } else {
        this.customRangeDates.set(null);
      }
      return;
    }

    // Predefined preset: calculate, apply, emit and close dropdown immediately
    const [start, end] = preset.calculate();
    this.applySelection(preset.id, preset.label, start, end);
    this.popover()?.hide();
  }

  onBackToPresets(): void {
    this.isCustomMode.set(false);
  }

  onApplyCustom(): void {
    const dates = this.customRangeDates();
    if (!dates || dates.length < 2 || !dates[0] || !dates[1]) return;

    const start = new Date(dates[0]);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dates[1]);
    end.setHours(23, 59, 59, 999);

    this.applySelection('custom', 'Custom Range', start, end);
    this.popover()?.hide();
  }

  onCancelCustom(): void {
    this.isCustomMode.set(false);
  }

  onClearClick(event: MouseEvent): void {
    event.stopPropagation();
    this.value.set(null);
    this.preset.set(null);
    this.activePresetId.set(null);
    this.activePresetLabel.set('');
    this.customRangeDates.set(null);
    this.onChange(null);
    this.clear.emit();
  }

  private applySelection(presetId: DateRangePresetId, presetLabel: string, start: Date, end: Date): void {
    const range: [Date, Date] = [start, end];
    this.value.set(range);
    this.preset.set(presetLabel);
    this.activePresetId.set(presetId);
    this.activePresetLabel.set(presetLabel);

    const formattedRange = formatRangeString(start, end);
    this.onChange(range);
    this.rangeChange.emit({
      preset: presetLabel,
      presetId,
      startDate: start,
      endDate: end,
      formattedRange,
    });
  }
}

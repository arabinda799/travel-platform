import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  FileUploadFieldComponent,
  DatePickerFieldComponent,
  FilterSidebarComponent,
  StatusModalComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  STATUS_OPTIONS,
  ThumbImageComponent,
} from 'admin-core';
import { Slider, SliderBadge, SliderPlatform, SliderService } from './slider.service';

@Component({
  selector: 'app-sliders',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    FileUploadFieldComponent,
    DatePickerFieldComponent,
    FilterSidebarComponent,
    StatusModalComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
    ThumbImageComponent,
  ],
  templateUrl: './sliders.html',
  styleUrl: './sliders.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SlidersComponent implements OnInit {
  private readonly sliderService = inject(SliderService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly sliders = this.sliderService.sliders;
  readonly loading = this.sliderService.loading;
  readonly isSaving = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  readonly selectedSliders = signal<Slider[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedServiceFilter = signal<string | null>(null);
  readonly appliedServiceFilter = signal<string | null>(null);
  readonly selectedPlatformFilter = signal<string | null>(null);
  readonly appliedPlatformFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<[Date, Date] | null>(null);
  readonly appliedDateRangeFilter = signal<[Date, Date] | null>(null);

  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly statusModalVisible = signal<boolean>(false);

  readonly formImageFileName = signal<string>('');

  readonly form = new FormGroup({
    serviceType: new FormControl<'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS'>('HOTEL', Validators.required),
    platform: new FormControl<SliderPlatform>('ALL', Validators.required),
    userType: new FormControl<'B2C' | 'B2B'>('B2C'),
    mainTitle: new FormControl('', Validators.required),
    smallSubtitle: new FormControl(''),
    rightItalicText: new FormControl(''),
    imageUrl: new FormControl('', Validators.required),
    sortOrder: new FormControl('1'),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
    badgesText: new FormControl(''),
  });

  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<Slider | null>(null);

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly titleTpl = viewChild<TemplateRef<any>>('titleTpl');
  readonly serviceTpl = viewChild<TemplateRef<any>>('serviceTpl');
  readonly platformTpl = viewChild<TemplateRef<any>>('platformTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly serviceOptions = [
    { label: 'Hotel', value: 'HOTEL' },
    { label: 'Flight', value: 'FLIGHT' },
    { label: 'Holiday', value: 'HOLIDAY' },
    { label: 'Bus', value: 'BUS' },
  ];

  readonly platformOptions = [
    { label: 'All Platforms', value: 'ALL' },
    { label: 'Web', value: 'WEB' },
    { label: 'Android App', value: 'ANDROID' },
    { label: 'iOS App', value: 'IOS' },
  ];

  readonly statusOptions = STATUS_OPTIONS;

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'imageUrl', header: 'Slider Image', width: '8rem', bodyTemplate: this.imageTpl() },
    { field: 'mainTitle', header: 'Title & Headline', width: '24rem', sortable: true, bodyTemplate: this.titleTpl() },
    { field: 'serviceType', header: 'Service', width: '9rem', sortable: true, bodyTemplate: this.serviceTpl() },
    { field: 'platform', header: 'Platform', width: '9rem', sortable: true, bodyTemplate: this.platformTpl() },
    { field: 'sortOrder', header: 'Order', width: '6rem', align: 'center', sortable: true },
    { field: 'isActive', header: 'Status', width: '8.5rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'createdAt', header: 'Created Date', width: '13rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedServiceFilter()) count++;
    if (this.appliedPlatformFilter()) count++;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedDateRangeFilter() && this.appliedDateRangeFilter()![0]) count++;
    return count;
  });

  readonly filteredSliders = computed(() => {
    let list = this.sliders();
    const query = this.searchQuery().toLowerCase().trim();

    if (query) {
      list = list.filter(item =>
        (item.mainTitle || '').toLowerCase().includes(query) ||
        (item.smallSubtitle || '').toLowerCase().includes(query) ||
        (item.rightItalicText || '').toLowerCase().includes(query) ||
        (item.serviceType || '').toLowerCase().includes(query) ||
        (item.platform || '').toLowerCase().includes(query)
      );
    }

    const serviceFilter = this.appliedServiceFilter();
    if (serviceFilter) list = list.filter(item => item.serviceType === serviceFilter);

    const platformFilter = this.appliedPlatformFilter();
    if (platformFilter) list = list.filter(item => item.platform === platformFilter);

    const statusFilter = this.appliedStatusFilter();
    if (statusFilter) {
      const activeBool = statusFilter === 'Active';
      list = list.filter(item => item.isActive === activeBool);
    }

    const dateRange = this.appliedDateRangeFilter();
    if (dateRange && dateRange[0]) {
      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]).setHours(23, 59, 59, 999) : new Date(dateRange[0]).setHours(23, 59, 59, 999);
      list = list.filter(item => {
        const itemDate = new Date(item.createdAt.split('/')[0].trim()).getTime();
        return isNaN(itemDate) || (itemDate >= start && itemDate <= end);
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.sliderService.load();
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onApplyFilters(): void {
    this.appliedServiceFilter.set(this.selectedServiceFilter());
    this.appliedPlatformFilter.set(this.selectedPlatformFilter());
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedServiceFilter.set(null);
    this.selectedPlatformFilter.set(null);
    this.selectedStatusFilter.set(null);
    this.selectedDateRangeFilter.set(null);
    this.appliedServiceFilter.set(null);
    this.appliedPlatformFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openBulkStatusModal(): void {
    if (this.selectedSliders().length > 0) this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const activeBool = newStatus === 'Active';
    this.selectedSliders().forEach(sld => {
      this.sliderService.updateStatus(sld.id, activeBool)
        .pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${this.selectedSliders().length} sliders set to ${newStatus}` });
    this.selectedSliders.set([]);
    this.statusModalVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({
      serviceType: 'HOTEL', platform: 'ALL', userType: 'B2C',
      mainTitle: '', smallSubtitle: '', rightItalicText: '',
      imageUrl: '', sortOrder: String(this.sliders().length + 1),
      status: 'Active', badgesText: '',
    });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(slider: Slider): void {
    this.isEditing.set(true);
    this.editingId.set(slider.id);
    this.form.patchValue({
      serviceType: slider.serviceType,
      platform: slider.platform || 'ALL',
      userType: 'B2C',
      mainTitle: slider.mainTitle,
      smallSubtitle: slider.smallSubtitle || '',
      rightItalicText: slider.rightItalicText || '',
      imageUrl: slider.imageUrl,
      sortOrder: String(slider.sortOrder),
      status: slider.isActive ? 'Active' : 'Inactive',
      badgesText: (slider.badges || []).map(b => b.text).join(', '),
    });
    const parts = (slider.imageUrl || '').split('/');
    this.formImageFileName.set(parts[parts.length - 1].split('?')[0] || 'Slider Image');
    this.modalVisible.set(true);
  }

  onSaveSlider(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Required Fields Missing', detail: 'Please fill in all required fields before saving.' });
      return;
    }

    const v = this.form.getRawValue();
    const parsedBadges: SliderBadge[] = (v.badgesText || '')
      .split(',')
      .map(t => t.trim())
      .filter(Boolean)
      .map(text => ({ icon: 'verified', text }));

    const payload = {
      serviceType: v.serviceType || 'HOTEL',
      platform: v.platform || 'ALL',
      userType: (v.userType || 'B2C') as 'B2C' | 'B2B',
      mainTitle: (v.mainTitle || '').trim(),
      smallSubtitle: (v.smallSubtitle || '').trim(),
      rightItalicText: (v.rightItalicText || '').trim(),
      imageUrl: (v.imageUrl || '').trim(),
      sortOrder: Number(v.sortOrder) || 1,
      isActive: v.status === 'Active',
      badges: parsedBadges,
    };

    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.sliderService.updateSlider(id, payload) : this.sliderService.addSlider(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: id ? 'Slider Updated' : 'Slider Created', detail: id ? 'Hero slider updated successfully.' : 'New hero slider added successfully.' });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err?.error?.message || 'Could not save slider.' });
        this.isSaving.set(false);
      },
    });
  }

  confirmDeleteSingle(slider: Slider): void {
    this.itemToDelete.set(slider);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedSliders().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.sliderService.deleteSlider(single.id)
      : this.sliderService.bulkDelete(this.selectedSliders().map(s => s.id));

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Slider "${single.mainTitle}" deleted successfully.` });
        } else {
          const count = this.selectedSliders().length;
          this.selectedSliders.set([]);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${count} sliders deleted successfully.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete slider(s).' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
  TemplateRef, viewChild, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, SelectFieldComponent,
  FileUploadFieldComponent, DatePickerFieldComponent,
  FilterSidebarComponent, StatusBadgeComponent, TableActionComponent,
  ThumbImageComponent, TableColumn, TableLazyEvent, STATUS_OPTIONS, BreadcrumbItem,
} from 'admin-core';
import {
  HotelCoupon, HotelCouponService, CouponType, CouponStatus, ShowOnList,
} from './hotel-coupon.service';

function toDate(val: string | Date | null | undefined): Date | null {
  if (!val) return null;
  if (val instanceof Date) return val;
  const d = new Date(val);
  return isNaN(d.getTime()) ? null : d;
}

function formatDateToIso(date: Date | string | null | undefined): string {
  if (!date) return '';
  if (typeof date === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(date)) return date.substring(0, 10);
    const d = new Date(date);
    if (isNaN(d.getTime())) return date;
    date = d;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

@Component({
  selector: 'app-hotel-coupon',
  standalone: true,
  imports: [
    DecimalPipe, ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    FileUploadFieldComponent, DatePickerFieldComponent,
    FilterSidebarComponent, StatusBadgeComponent, TableActionComponent, ThumbImageComponent,
  ],
  templateUrl: './hotel-coupon.html',
  styleUrl: './hotel-coupon.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelCouponComponent implements OnInit {
  readonly couponService = inject(HotelCouponService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', route: '/dashboard' },
    { label: 'Finance' },
    { label: 'Hotel Coupons' },
  ];

  readonly coupons = this.couponService.coupons;
  readonly loading = this.couponService.loading;
  readonly searchQuery = signal<string>('');
  readonly isSaving = signal<boolean>(false);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedRegionFilter = signal<string | null>(null);
  readonly appliedRegionFilter = signal<string | null>(null);
  readonly selectedTypeFilter = signal<string | null>(null);
  readonly appliedTypeFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly selectedShowOnListFilter = signal<string | null>(null);
  readonly appliedShowOnListFilter = signal<string | null>(null);

  readonly activeFilterCount = computed<number>(() => {
    let count = 0;
    if (this.appliedRegionFilter() && this.appliedRegionFilter() !== 'All') count++;
    if (this.appliedTypeFilter()) count++;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedShowOnListFilter()) count++;
    return count;
  });

  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly formImageFileName = signal<string>('');

  readonly form = new FormGroup({
    regionType: new FormControl<string>('Domestic', Validators.required),
    starRating: new FormControl<string>('All', Validators.required),
    couponCode: new FormControl<string>('', [Validators.required, Validators.minLength(3), Validators.pattern('^[a-zA-Z0-9_-]+$')]),
    checkInDate: new FormControl<Date | string | null>(null, Validators.required),
    checkOutDate: new FormControl<Date | string | null>(null, Validators.required),
    couponType: new FormControl<CouponType>('Fixed', Validators.required),
    value: new FormControl<number | null>(null, [Validators.required, Validators.min(1)]),
    couponUseLimit: new FormControl<number | null>(100, [Validators.required, Validators.min(1)]),
    showOnList: new FormControl<ShowOnList>('Yes', Validators.required),
    couponMaxLimit: new FormControl<number | null>(500, [Validators.required, Validators.min(1)]),
    status: new FormControl<CouponStatus>('Active', Validators.required),
    validFromDate: new FormControl<Date | string | null>(null, Validators.required),
    validToDate: new FormControl<Date | string | null>(null, Validators.required),
    imageUrl: new FormControl<string>(''),
    couponText: new FormControl<string>(''),
  });

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly codeTpl = viewChild<TemplateRef<any>>('codeTpl');
  readonly detailsTpl = viewChild<TemplateRef<any>>('detailsTpl');
  readonly discountTpl = viewChild<TemplateRef<any>>('discountTpl');
  readonly stayDatesTpl = viewChild<TemplateRef<any>>('stayDatesTpl');
  readonly validityTpl = viewChild<TemplateRef<any>>('validityTpl');
  readonly usageTpl = viewChild<TemplateRef<any>>('usageTpl');
  readonly showOnListTpl = viewChild<TemplateRef<any>>('showOnListTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly regionOptions = [
    { label: 'All Regions', value: 'All' },
    { label: 'Domestic', value: 'Domestic' },
    { label: 'International', value: 'International' },
  ];

  readonly starRatingOptions = [
    { label: 'All Star Ratings', value: 'All' },
    { label: '5 Star', value: '5 Star' },
    { label: '4 Star', value: '4 Star' },
    { label: '4 Star, 5 Star', value: '4 Star, 5 Star' },
    { label: '3 Star, 4 Star', value: '3 Star, 4 Star' },
    { label: '3 Star', value: '3 Star' },
    { label: '1 - 2 Star', value: '1 - 2 Star' },
  ];

  readonly couponTypeOptions = [
    { label: 'Fixed Amount (₹)', value: 'Fixed' },
    { label: 'Percentage (%)', value: 'Percentage' },
  ];

  readonly showOnListOptions = [
    { label: 'Yes', value: 'Yes' },
    { label: 'No', value: 'No' },
  ];

  readonly statusOptions = STATUS_OPTIONS;

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'imageUrl', header: 'Banner', width: '6.5rem', bodyTemplate: this.imageTpl() },
    { field: 'couponCode', header: 'Coupon Code', width: '12rem', sortable: true, bodyTemplate: this.codeTpl() },
    { field: 'couponText', header: 'Title & Criteria', width: '18rem', sortable: true, bodyTemplate: this.detailsTpl() },
    { field: 'value', header: 'Discount Value', width: '11rem', sortable: true, bodyTemplate: this.discountTpl() },
    { field: 'checkInDate', header: 'Stay Window', width: '12rem', bodyTemplate: this.stayDatesTpl() },
    { field: 'validFromDate', header: 'Validity Period', width: '12rem', bodyTemplate: this.validityTpl() },
    { field: 'usedCount', header: 'Usage', width: '9rem', sortable: true, bodyTemplate: this.usageTpl() },
    { field: 'showOnList', header: 'Show On List', width: '7.5rem', bodyTemplate: this.showOnListTpl() },
    { field: 'status', header: 'Status', width: '7.5rem', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '5.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly filteredCoupons = computed<HotelCoupon[]>(() => {
    let result = this.coupons();
    const query = this.searchQuery().trim().toLowerCase();
    if (query) {
      result = result.filter(c =>
        c.couponCode.toLowerCase().includes(query) ||
        c.couponText.toLowerCase().includes(query) ||
        c.regionType.toLowerCase().includes(query) ||
        c.starRating.toLowerCase().includes(query)
      );
    }
    const region = this.appliedRegionFilter();
    if (region && region !== 'All') result = result.filter(c => c.regionType === region || c.regionType === 'All');
    const type = this.appliedTypeFilter();
    if (type) result = result.filter(c => c.couponType === type);
    const status = this.appliedStatusFilter();
    if (status) result = result.filter(c => c.status === status);
    const showOnList = this.appliedShowOnListFilter();
    if (showOnList) result = result.filter(c => c.showOnList === showOnList);
    return result;
  });

  ngOnInit(): void {
    this.couponService.load();
  }

  onLazyLoad(e: TableLazyEvent): void {
    const page = Math.floor((e.first ?? 0) / (e.rows ?? 50)) + 1;
    if (page !== this.couponService.page()) this.couponService.goToPage(page);
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  openFilter(): void {
    this.selectedRegionFilter.set(this.appliedRegionFilter());
    this.selectedTypeFilter.set(this.appliedTypeFilter());
    this.selectedStatusFilter.set(this.appliedStatusFilter());
    this.selectedShowOnListFilter.set(this.appliedShowOnListFilter());
    this.filterVisible.set(true);
  }

  onApplyFilters(): void {
    this.appliedRegionFilter.set(this.selectedRegionFilter());
    this.appliedTypeFilter.set(this.selectedTypeFilter());
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedShowOnListFilter.set(this.selectedShowOnListFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedRegionFilter.set(null);
    this.selectedTypeFilter.set(null);
    this.selectedStatusFilter.set(null);
    this.selectedShowOnListFilter.set(null);
    this.appliedRegionFilter.set(null);
    this.appliedTypeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedShowOnListFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.formImageFileName.set('');
    const now = new Date();
    const futureCheckIn = new Date(); futureCheckIn.setDate(now.getDate() + 1);
    const futureCheckOut = new Date(); futureCheckOut.setDate(now.getDate() + 60);
    const validTo = new Date(); validTo.setDate(now.getDate() + 45);
    this.form.reset({
      regionType: 'Domestic', starRating: 'All', couponCode: this.generateRandomCode(),
      checkInDate: futureCheckIn, checkOutDate: futureCheckOut,
      couponType: 'Fixed', value: 500, couponUseLimit: 100, showOnList: 'Yes',
      couponMaxLimit: 500, status: 'Active', validFromDate: now, validToDate: validTo,
      imageUrl: '', couponText: '',
    });
    this.modalVisible.set(true);
  }

  openEditModal(coupon: HotelCoupon): void {
    this.isEditing.set(true);
    this.editingId.set(coupon.id);
    this.formImageFileName.set(coupon.imageUrl ? coupon.imageUrl.split('/').pop() || 'banner.jpg' : '');
    this.form.reset({
      regionType: coupon.regionType, starRating: coupon.starRating, couponCode: coupon.couponCode,
      checkInDate: toDate(coupon.checkInDate), checkOutDate: toDate(coupon.checkOutDate),
      couponType: coupon.couponType, value: coupon.value, couponUseLimit: coupon.couponUseLimit,
      showOnList: coupon.showOnList, couponMaxLimit: coupon.couponMaxLimit, status: coupon.status,
      validFromDate: toDate(coupon.validFromDate), validToDate: toDate(coupon.validToDate),
      imageUrl: coupon.imageUrl, couponText: coupon.couponText,
    });
    this.modalVisible.set(true);
  }

  generateRandomCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'HOTEL';
    for (let i = 0; i < 5; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    return code;
  }

  generateNewCode(): void {
    this.form.patchValue({ couponCode: this.generateRandomCode() });
  }

  onSaveCoupon(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.messageService.add({ severity: 'warn', summary: 'Validation Required', detail: 'Please fill in all mandatory fields with valid values.' });
      return;
    }

    const fv = this.form.getRawValue();
    const payload = {
      regionType: fv.regionType || 'All',
      starRating: fv.starRating || 'All',
      couponCode: (fv.couponCode || '').toUpperCase().trim(),
      checkInDate: formatDateToIso(fv.checkInDate),
      checkOutDate: formatDateToIso(fv.checkOutDate),
      couponType: fv.couponType as CouponType,
      value: Number(fv.value) || 0,
      couponUseLimit: Number(fv.couponUseLimit) || 1,
      couponMaxLimit: Number(fv.couponMaxLimit) || 0,
      showOnList: (fv.showOnList || 'Yes') as ShowOnList,
      status: (fv.status || 'Active') as CouponStatus,
      validFromDate: formatDateToIso(fv.validFromDate),
      validToDate: formatDateToIso(fv.validToDate),
      imageUrl: fv.imageUrl || '',
      couponText: fv.couponText || '',
    };

    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.couponService.updateCoupon(id, payload) : this.couponService.addCoupon(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Coupon Updated' : 'Coupon Created',
          detail: `Coupon ${result.couponCode} ${id ? 'updated' : 'created'} successfully.`,
        });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        const detail = err?.error?.message || 'Could not save coupon.';
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail });
        this.isSaving.set(false);
      },
    });
  }

  copyCouponCode(code: string, event?: Event): void {
    if (event) event.stopPropagation();
    navigator.clipboard.writeText(code).then(
      () => this.messageService.add({ severity: 'info', summary: 'Copied to Clipboard', detail: `Coupon code ${code} copied!`, life: 2000 }),
      () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to copy code.' }),
    );
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
  TemplateRef, viewChild, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  StatusBadgeComponent, StatusModalComponent, FormModalComponent,
  ConfirmDialogComponent, TextFieldComponent, SelectFieldComponent,
  TableActionComponent, TableColumn, TableLazyEvent, BreadcrumbItem,
} from 'admin-core';
import {
  HotelPricingService, HotelDiscount, PricingTarget, ALL_REGION_TYPES,
} from '../hotel-pricing.service';

@Component({
  selector: 'app-hotel-discount',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    StatusBadgeComponent, StatusModalComponent, FormModalComponent,
    ConfirmDialogComponent, TextFieldComponent, SelectFieldComponent, TableActionComponent,
  ],
  templateUrl: './hotel-discount.html',
  styleUrl: './hotel-discount.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelDiscountComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(HotelPricingService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly allRegions = ALL_REGION_TYPES;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Discount' },
    { label: 'Hotel Discount' },
  ];

  readonly discounts = this.pricingService.discounts;
  readonly isLoading = this.pricingService.loading;
  readonly searchQuery = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  selectedDiscounts: HotelDiscount[] = [];

  readonly filteredDiscounts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.discounts();
    if (!q) return list;
    return list.filter(d =>
      d.markupFor.toLowerCase().includes(q) ||
      d.regionTypes.some(r => r.toLowerCase().includes(q))
    );
  });

  readonly regionTpl = viewChild<TemplateRef<any>>('regionTpl');
  readonly valueTpl = viewChild<TemplateRef<any>>('valueTpl');
  readonly limitTpl = viewChild<TemplateRef<any>>('limitTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<any>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'markupFor', header: 'Discount For', sortable: true, width: '10rem' },
    { field: 'regionTypes', header: 'Region Type', sortable: false, width: '16rem', bodyTemplate: this.regionTpl() },
    { field: 'value', header: 'Value', sortable: true, width: '9rem', align: 'right', bodyTemplate: this.valueTpl() },
    { field: 'maxLimit', header: 'Max Limit', sortable: true, width: '10rem', align: 'right', bodyTemplate: this.limitTpl() },
    { field: 'status', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '13rem', bodyTemplate: this.dateTpl() },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', bodyTemplate: this.actionsTpl(), frozen: true, frozenAlign: 'right' },
  ]);

  readonly markupForOptions = [
    { label: 'Please Select', value: '' },
    { label: 'B2B', value: 'B2B' as PricingTarget },
    { label: 'B2C', value: 'B2C' as PricingTarget },
    { label: 'Corporate', value: 'Corporate' as PricingTarget },
    { label: 'All', value: 'All' as PricingTarget },
  ];

  readonly statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  readonly isModalVisible = signal<boolean>(false);
  readonly editingDiscountId = signal<string | null>(null);
  readonly isRegionDropdownOpen = signal<boolean>(false);
  readonly isDeleteModalVisible = signal<boolean>(false);
  readonly discountToDelete = signal<HotelDiscount | null>(null);
  readonly isStatusModalVisible = signal<boolean>(false);

  discountForm: FormGroup = this.fb.group({
    markupFor: ['B2B', [Validators.required]],
    regionTypes: [['Domestic'], [Validators.required]],
    value: [5, [Validators.required, Validators.min(0)]],
    maxLimit: [1500],
    status: ['Active', [Validators.required]],
  });

  get modalTitle(): string {
    return this.editingDiscountId() ? 'EDIT HOTEL DISCOUNT' : 'ADD HOTEL DISCOUNT';
  }

  ngOnInit(): void {
    this.pricingService.loadDiscounts();
  }

  onSearch(query: string): void { this.searchQuery.set(query); }
  onLazyLoad(_event: TableLazyEvent): void {}

  openAddModal(): void {
    this.editingDiscountId.set(null);
    this.discountForm.reset({ markupFor: 'B2B', regionTypes: ['Domestic'], value: 5, maxLimit: 1500, status: 'Active' });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  openEditModal(discount: HotelDiscount): void {
    this.editingDiscountId.set(discount.id);
    this.discountForm.patchValue({ markupFor: discount.markupFor, regionTypes: [...discount.regionTypes], value: discount.value, maxLimit: discount.maxLimit, status: discount.status });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.editingDiscountId.set(null);
  }

  toggleRegionDropdown(): void { this.isRegionDropdownOpen.update(open => !open); }

  isRegionSelected(region: string): boolean {
    return ((this.discountForm.get('regionTypes')?.value as string[]) || []).includes(region);
  }

  toggleRegion(region: string): void {
    const current = (this.discountForm.get('regionTypes')?.value as string[]) || [];
    const updated = current.includes(region) ? current.filter(r => r !== region) : [...current, region];
    this.discountForm.patchValue({ regionTypes: updated });
    this.discountForm.get('regionTypes')?.markAsDirty();
  }

  onSubmitDiscount(): void {
    this.discountForm.markAllAsTouched();
    if (this.discountForm.invalid || !this.discountForm.value.markupFor) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 4000 });
      return;
    }

    const formVal = this.discountForm.value;
    const payload = {
      markupFor: formVal.markupFor,
      regionTypes: formVal.regionTypes,
      value: Number(formVal.value) || 0,
      maxLimit: formVal.maxLimit !== '' && formVal.maxLimit !== null ? Number(formVal.maxLimit) : null,
      status: formVal.status,
    };

    this.isSaving.set(true);
    const id = this.editingDiscountId();
    const obs$ = id ? this.pricingService.updateDiscount(id, payload) : this.pricingService.addDiscount(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Discount Updated' : 'Discount Added',
          detail: id ? 'Hotel discount rule updated successfully.' : 'New hotel discount rule added successfully.',
          life: 4000,
        });
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save discount rule.', life: 4000 });
        this.isSaving.set(false);
      },
    });
  }

  openDeleteModal(discount: HotelDiscount): void {
    this.discountToDelete.set(discount);
    this.isDeleteModalVisible.set(true);
  }

  confirmDelete(): void {
    const d = this.discountToDelete();
    if (!d) return;
    this.pricingService.deleteDiscount(d.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Discount Removed', detail: `Discount rule for ${d.markupFor} deleted.`, life: 3000 });
        this.isDeleteModalVisible.set(false);
        this.discountToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not remove discount rule.', life: 3000 });
        this.isDeleteModalVisible.set(false);
      },
    });
  }

  onStatusChangeSubmit(event: string | { status: string; reason?: string }): void {
    const newStatus = (typeof event === 'string' ? event : event.status) as 'Active' | 'Inactive';
    const ids = this.selectedDiscounts.map(d => d.id);
    this.pricingService.updateMultipleDiscountStatus(ids, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedDiscounts = [];
        this.isStatusModalVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `Updated status to "${newStatus}" for selected discounts.`, life: 4000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not update status.', life: 4000 });
      },
    });
  }
}

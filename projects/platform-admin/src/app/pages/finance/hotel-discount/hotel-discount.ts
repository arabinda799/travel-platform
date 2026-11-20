import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  StatusBadgeComponent,
  StatusModalComponent,
  FormModalComponent,
  ConfirmDialogComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TableActionComponent,
  TableColumn,
  TableLazyEvent,
  BreadcrumbItem,
} from 'admin-core';
import {
  HotelPricingService,
  HotelDiscount,
  PricingTarget,
  ALL_REGION_TYPES,
} from '../hotel-pricing.service';

@Component({
  selector: 'app-hotel-discount',
  standalone: true,
  imports: [
    DatePipe,
    DecimalPipe,
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    StatusBadgeComponent,
    StatusModalComponent,
    FormModalComponent,
    ConfirmDialogComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TableActionComponent,
  ],
  templateUrl: './hotel-discount.html',
  styleUrl: './hotel-discount.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelDiscountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(HotelPricingService);
  private readonly messageService = inject(MessageService);

  readonly allRegions = ALL_REGION_TYPES;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Discount' },
    { label: 'Hotel Discount' },
  ];

  // Table State
  readonly discounts = this.pricingService.discounts;
  readonly isLoading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  selectedDiscounts: HotelDiscount[] = [];

  readonly filteredDiscounts = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.discounts();
    if (!q) return list;
    return list.filter(
      (d) =>
        d.markupFor.toLowerCase().includes(q) ||
        d.regionTypes.some((r) => r.toLowerCase().includes(q))
    );
  });

  // Table Templates
  readonly regionTpl = viewChild<TemplateRef<any>>('regionTpl');
  readonly valueTpl = viewChild<TemplateRef<any>>('valueTpl');
  readonly limitTpl = viewChild<TemplateRef<any>>('limitTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<any>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  // Columns
  readonly columns = computed<TableColumn[]>(() => [
    { field: 'markupFor', header: 'Discount For', sortable: true, width: '10rem' },
    { field: 'regionTypes', header: 'Region Type', sortable: false, width: '16rem', bodyTemplate: this.regionTpl() },
    { field: 'value', header: 'Value', sortable: true, width: '9rem', align: 'right', bodyTemplate: this.valueTpl() },
    { field: 'maxLimit', header: 'Max Limit', sortable: true, width: '10rem', align: 'right', bodyTemplate: this.limitTpl() },
    { field: 'status', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '13rem', bodyTemplate: this.dateTpl() },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', bodyTemplate: this.actionsTpl(), frozen: true, frozenAlign: 'right' },
  ]);

  // Dropdown Options Matching Image 2
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

  // Modal State
  readonly isModalVisible = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly editingDiscountId = signal<string | null>(null);
  readonly isRegionDropdownOpen = signal<boolean>(false);

  // Delete State
  readonly isDeleteModalVisible = signal<boolean>(false);
  readonly discountToDelete = signal<HotelDiscount | null>(null);

  // Status Change State
  readonly isStatusModalVisible = signal<boolean>(false);

  // Form (Matches Image 2)
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

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onLazyLoad(_event: TableLazyEvent): void {}

  openAddModal(): void {
    this.editingDiscountId.set(null);
    this.discountForm.reset({
      markupFor: 'B2B',
      regionTypes: ['Domestic'],
      value: 5,
      maxLimit: 1500,
      status: 'Active',
    });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  openEditModal(discount: HotelDiscount): void {
    this.editingDiscountId.set(discount.id);
    this.discountForm.patchValue({
      markupFor: discount.markupFor,
      regionTypes: [...discount.regionTypes],
      value: discount.value,
      maxLimit: discount.maxLimit,
      status: discount.status,
    });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.editingDiscountId.set(null);
  }

  // Region Multi-select (Matching Image 2 "1 selected")
  toggleRegionDropdown(): void {
    this.isRegionDropdownOpen.update((open) => !open);
  }

  isRegionSelected(region: string): boolean {
    const selected = (this.discountForm.get('regionTypes')?.value as string[]) || [];
    return selected.includes(region);
  }

  toggleRegion(region: string): void {
    const current = (this.discountForm.get('regionTypes')?.value as string[]) || [];
    let updated: string[];
    if (current.includes(region)) {
      updated = current.filter((r) => r !== region);
    } else {
      updated = [...current, region];
    }
    this.discountForm.patchValue({ regionTypes: updated });
    this.discountForm.get('regionTypes')?.markAsDirty();
  }

  onSubmitDiscount(): void {
    this.discountForm.markAllAsTouched();
    if (this.discountForm.invalid || !this.discountForm.value.markupFor) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 4000,
      });
      return;
    }

    this.isSaving.set(true);
    const formVal = this.discountForm.value;

    setTimeout(() => {
      const id = this.editingDiscountId();
      if (id) {
        this.pricingService.updateDiscount(id, {
          markupFor: formVal.markupFor,
          regionTypes: formVal.regionTypes,
          value: Number(formVal.value) || 0,
          maxLimit: formVal.maxLimit !== '' && formVal.maxLimit !== null ? Number(formVal.maxLimit) : null,
          status: formVal.status,
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Discount Updated',
          detail: 'Hotel discount rule updated successfully.',
          life: 4000,
        });
      } else {
        this.pricingService.addDiscount({
          markupFor: formVal.markupFor,
          regionTypes: formVal.regionTypes,
          value: Number(formVal.value) || 0,
          maxLimit: formVal.maxLimit !== '' && formVal.maxLimit !== null ? Number(formVal.maxLimit) : null,
          status: formVal.status,
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Discount Added',
          detail: 'New hotel discount rule added successfully.',
          life: 4000,
        });
      }

      this.isSaving.set(false);
      this.closeModal();
    }, 400);
  }

  openDeleteModal(discount: HotelDiscount): void {
    this.discountToDelete.set(discount);
    this.isDeleteModalVisible.set(true);
  }

  confirmDelete(): void {
    const d = this.discountToDelete();
    if (d) {
      this.pricingService.deleteDiscount(d.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Discount Removed',
        detail: `Discount rule for ${d.markupFor} deleted.`,
        life: 3000,
      });
    }
    this.isDeleteModalVisible.set(false);
    this.discountToDelete.set(null);
  }

  onStatusChangeSubmit(event: string | { status: string; reason?: string }): void {
    const rawStatus = typeof event === 'string' ? event : event.status;
    const newStatus = rawStatus as 'Active' | 'Inactive';
    const ids = this.selectedDiscounts.map((d) => d.id);
    this.pricingService.updateMultipleDiscountStatus(ids, newStatus);
    this.selectedDiscounts = [];
    this.isStatusModalVisible.set(false);

    this.messageService.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Updated status to "${newStatus}" for selected discounts.`,
      life: 4000,
    });
  }
}

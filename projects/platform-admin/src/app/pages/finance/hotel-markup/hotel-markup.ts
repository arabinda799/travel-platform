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
  HotelMarkup,
  PricingTarget,
  HotelMarkupType,
  DisplayMarkup,
  ALL_REGION_TYPES,
} from '../hotel-pricing.service';

@Component({
  selector: 'app-hotel-markup',
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
  templateUrl: './hotel-markup.html',
  styleUrl: './hotel-markup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelMarkupComponent {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(HotelPricingService);
  private readonly messageService = inject(MessageService);

  readonly allRegions = ALL_REGION_TYPES;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Markup' },
    { label: 'Hotel Markup' },
  ];

  // Table State
  readonly markups = this.pricingService.markups;
  readonly isLoading = signal<boolean>(false);
  readonly searchQuery = signal<string>('');
  selectedMarkups: HotelMarkup[] = [];

  readonly filteredMarkups = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.markups();
    if (!q) return list;
    return list.filter(
      (m) =>
        m.markupFor.toLowerCase().includes(q) ||
        m.hotelMarkupType.toLowerCase().includes(q) ||
        m.displayMarkup.toLowerCase().includes(q) ||
        m.regionTypes.some((r) => r.toLowerCase().includes(q))
    );
  });

  // Table Templates
  readonly regionTpl = viewChild<TemplateRef<any>>('regionTpl');
  readonly valueTpl = viewChild<TemplateRef<any>>('valueTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<any>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  // Columns
  readonly columns = computed<TableColumn[]>(() => [
    { field: 'markupFor', header: 'Markup For', sortable: true, width: '9rem' },
    { field: 'regionTypes', header: 'Region Type', sortable: false, width: '15rem', bodyTemplate: this.regionTpl() },
    { field: 'hotelMarkupType', header: 'Hotel Markup Type', sortable: true, width: '12rem' },
    { field: 'displayMarkup', header: 'Display Markup', sortable: true, width: '11rem' },
    { field: 'value', header: 'Value', sortable: true, width: '9rem', align: 'right', bodyTemplate: this.valueTpl() },
    { field: 'status', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '13rem', bodyTemplate: this.dateTpl() },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', bodyTemplate: this.actionsTpl(), frozen: true, frozenAlign: 'right' },
  ]);

  // Dropdown Options Matching Image 1
  readonly markupForOptions = [
    { label: 'Please Select', value: '' },
    { label: 'B2B', value: 'B2B' as PricingTarget },
    { label: 'B2C', value: 'B2C' as PricingTarget },
    { label: 'Corporate', value: 'Corporate' as PricingTarget },
    { label: 'All', value: 'All' as PricingTarget },
  ];

  readonly markupTypeOptions = [
    { label: 'Per Night', value: 'Per Night' as HotelMarkupType },
    { label: 'Per Stay', value: 'Per Stay' as HotelMarkupType },
    { label: 'Percentage', value: 'Percentage' as HotelMarkupType },
    { label: 'Fixed', value: 'Fixed' as HotelMarkupType },
  ];

  readonly displayMarkupOptions = [
    { label: 'In Tax', value: 'In Tax' as DisplayMarkup },
    { label: 'In Room Rate', value: 'In Room Rate' as DisplayMarkup },
    { label: 'Separate Line Item', value: 'Separate Line Item' as DisplayMarkup },
  ];

  readonly statusOptions = [
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  // Modal State
  readonly isModalVisible = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly editingMarkupId = signal<string | null>(null);
  readonly isRegionDropdownOpen = signal<boolean>(false);

  // Delete State
  readonly isDeleteModalVisible = signal<boolean>(false);
  readonly markupToDelete = signal<HotelMarkup | null>(null);

  // Status Change State
  readonly isStatusModalVisible = signal<boolean>(false);

  // Form (Matches Image 1)
  markupForm: FormGroup = this.fb.group({
    markupFor: ['B2B', [Validators.required]],
    regionTypes: [['Domestic'], [Validators.required]],
    hotelMarkupType: ['Per Night', [Validators.required]],
    displayMarkup: ['In Tax', [Validators.required]],
    value: [100, [Validators.required, Validators.min(0)]],
    status: ['Active', [Validators.required]],
  });

  get modalTitle(): string {
    return this.editingMarkupId() ? 'EDIT HOTEL MARKUP' : 'ADD HOTEL MARKUP';
  }

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onLazyLoad(_event: TableLazyEvent): void {}

  openAddModal(): void {
    this.editingMarkupId.set(null);
    this.markupForm.reset({
      markupFor: 'B2B',
      regionTypes: ['Domestic'],
      hotelMarkupType: 'Per Night',
      displayMarkup: 'In Tax',
      value: 100,
      status: 'Active',
    });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  openEditModal(markup: HotelMarkup): void {
    this.editingMarkupId.set(markup.id);
    this.markupForm.patchValue({
      markupFor: markup.markupFor,
      regionTypes: [...markup.regionTypes],
      hotelMarkupType: markup.hotelMarkupType,
      displayMarkup: markup.displayMarkup,
      value: markup.value,
      status: markup.status,
    });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.editingMarkupId.set(null);
  }

  // Region Multi-select (Matching Image 1 "1 selected")
  toggleRegionDropdown(): void {
    this.isRegionDropdownOpen.update((open) => !open);
  }

  isRegionSelected(region: string): boolean {
    const selected = (this.markupForm.get('regionTypes')?.value as string[]) || [];
    return selected.includes(region);
  }

  toggleRegion(region: string): void {
    const current = (this.markupForm.get('regionTypes')?.value as string[]) || [];
    let updated: string[];
    if (current.includes(region)) {
      updated = current.filter((r) => r !== region);
    } else {
      updated = [...current, region];
    }
    this.markupForm.patchValue({ regionTypes: updated });
    this.markupForm.get('regionTypes')?.markAsDirty();
  }

  onSubmitMarkup(): void {
    this.markupForm.markAllAsTouched();
    if (this.markupForm.invalid || !this.markupForm.value.markupFor) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields.',
        life: 4000,
      });
      return;
    }

    this.isSaving.set(true);
    const formVal = this.markupForm.value;

    setTimeout(() => {
      const id = this.editingMarkupId();
      if (id) {
        this.pricingService.updateMarkup(id, {
          markupFor: formVal.markupFor,
          regionTypes: formVal.regionTypes,
          hotelMarkupType: formVal.hotelMarkupType,
          displayMarkup: formVal.displayMarkup,
          value: Number(formVal.value) || 0,
          status: formVal.status,
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Markup Updated',
          detail: 'Hotel markup rule updated successfully.',
          life: 4000,
        });
      } else {
        this.pricingService.addMarkup({
          markupFor: formVal.markupFor,
          regionTypes: formVal.regionTypes,
          hotelMarkupType: formVal.hotelMarkupType,
          displayMarkup: formVal.displayMarkup,
          value: Number(formVal.value) || 0,
          status: formVal.status,
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Markup Added',
          detail: 'New hotel markup rule added successfully.',
          life: 4000,
        });
      }

      this.isSaving.set(false);
      this.closeModal();
    }, 400);
  }

  openDeleteModal(markup: HotelMarkup): void {
    this.markupToDelete.set(markup);
    this.isDeleteModalVisible.set(true);
  }

  confirmDelete(): void {
    const m = this.markupToDelete();
    if (m) {
      this.pricingService.deleteMarkup(m.id);
      this.messageService.add({
        severity: 'info',
        summary: 'Markup Removed',
        detail: `Markup rule for ${m.markupFor} deleted.`,
        life: 3000,
      });
    }
    this.isDeleteModalVisible.set(false);
    this.markupToDelete.set(null);
  }

  onStatusChangeSubmit(event: string | { status: string; reason?: string }): void {
    const rawStatus = typeof event === 'string' ? event : event.status;
    const newStatus = rawStatus as 'Active' | 'Inactive';
    const ids = this.selectedMarkups.map((m) => m.id);
    this.pricingService.updateMultipleMarkupStatus(ids, newStatus);
    this.selectedMarkups = [];
    this.isStatusModalVisible.set(false);

    this.messageService.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `Updated status to "${newStatus}" for selected markups.`,
      life: 4000,
    });
  }
}

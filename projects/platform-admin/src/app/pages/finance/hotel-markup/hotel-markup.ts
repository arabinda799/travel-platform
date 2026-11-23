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
  HotelPricingService, HotelMarkup, PricingTarget, HotelMarkupType, DisplayMarkup, ALL_REGION_TYPES,
} from '../hotel-pricing.service';

@Component({
  selector: 'app-hotel-markup',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    StatusBadgeComponent, StatusModalComponent, FormModalComponent,
    ConfirmDialogComponent, TextFieldComponent, SelectFieldComponent, TableActionComponent,
  ],
  templateUrl: './hotel-markup.html',
  styleUrl: './hotel-markup.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelMarkupComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly pricingService = inject(HotelPricingService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly allRegions = ALL_REGION_TYPES;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Markup' },
    { label: 'Hotel Markup' },
  ];

  readonly markups = this.pricingService.markups;
  readonly isLoading = this.pricingService.loading;
  readonly searchQuery = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  selectedMarkups: HotelMarkup[] = [];

  readonly filteredMarkups = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.markups();
    if (!q) return list;
    return list.filter(m =>
      m.markupFor.toLowerCase().includes(q) ||
      m.hotelMarkupType.toLowerCase().includes(q) ||
      m.displayMarkup.toLowerCase().includes(q) ||
      m.regionTypes.some(r => r.toLowerCase().includes(q))
    );
  });

  readonly regionTpl = viewChild<TemplateRef<any>>('regionTpl');
  readonly valueTpl = viewChild<TemplateRef<any>>('valueTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<any>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

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

  readonly isModalVisible = signal<boolean>(false);
  readonly editingMarkupId = signal<string | null>(null);
  readonly isRegionDropdownOpen = signal<boolean>(false);
  readonly isDeleteModalVisible = signal<boolean>(false);
  readonly markupToDelete = signal<HotelMarkup | null>(null);
  readonly isStatusModalVisible = signal<boolean>(false);

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

  ngOnInit(): void {
    this.pricingService.loadMarkups();
  }

  onSearch(query: string): void { this.searchQuery.set(query); }
  onLazyLoad(_event: TableLazyEvent): void {}

  openAddModal(): void {
    this.editingMarkupId.set(null);
    this.markupForm.reset({ markupFor: 'B2B', regionTypes: ['Domestic'], hotelMarkupType: 'Per Night', displayMarkup: 'In Tax', value: 100, status: 'Active' });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  openEditModal(markup: HotelMarkup): void {
    this.editingMarkupId.set(markup.id);
    this.markupForm.patchValue({ markupFor: markup.markupFor, regionTypes: [...markup.regionTypes], hotelMarkupType: markup.hotelMarkupType, displayMarkup: markup.displayMarkup, value: markup.value, status: markup.status });
    this.isRegionDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.editingMarkupId.set(null);
  }

  toggleRegionDropdown(): void { this.isRegionDropdownOpen.update(open => !open); }

  isRegionSelected(region: string): boolean {
    return ((this.markupForm.get('regionTypes')?.value as string[]) || []).includes(region);
  }

  toggleRegion(region: string): void {
    const current = (this.markupForm.get('regionTypes')?.value as string[]) || [];
    const updated = current.includes(region) ? current.filter(r => r !== region) : [...current, region];
    this.markupForm.patchValue({ regionTypes: updated });
    this.markupForm.get('regionTypes')?.markAsDirty();
  }

  onSubmitMarkup(): void {
    this.markupForm.markAllAsTouched();
    if (this.markupForm.invalid || !this.markupForm.value.markupFor) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 4000 });
      return;
    }

    const formVal = this.markupForm.value;
    const payload = {
      markupFor: formVal.markupFor,
      regionTypes: formVal.regionTypes,
      hotelMarkupType: formVal.hotelMarkupType,
      displayMarkup: formVal.displayMarkup,
      value: Number(formVal.value) || 0,
      status: formVal.status,
    };

    this.isSaving.set(true);
    const id = this.editingMarkupId();
    const obs$ = id ? this.pricingService.updateMarkup(id, payload) : this.pricingService.addMarkup(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Markup Updated' : 'Markup Added',
          detail: id ? 'Hotel markup rule updated successfully.' : 'New hotel markup rule added successfully.',
          life: 4000,
        });
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save markup rule.', life: 4000 });
        this.isSaving.set(false);
      },
    });
  }

  openDeleteModal(markup: HotelMarkup): void {
    this.markupToDelete.set(markup);
    this.isDeleteModalVisible.set(true);
  }

  confirmDelete(): void {
    const m = this.markupToDelete();
    if (!m) return;
    this.pricingService.deleteMarkup(m.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Markup Removed', detail: `Markup rule for ${m.markupFor} deleted.`, life: 3000 });
        this.isDeleteModalVisible.set(false);
        this.markupToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not remove markup rule.', life: 3000 });
        this.isDeleteModalVisible.set(false);
      },
    });
  }

  onStatusChangeSubmit(event: string | { status: string; reason?: string }): void {
    const newStatus = (typeof event === 'string' ? event : event.status) as 'Active' | 'Inactive';
    const ids = this.selectedMarkups.map(m => m.id);
    this.pricingService.updateMultipleMarkupStatus(ids, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedMarkups = [];
        this.isStatusModalVisible.set(false);
        this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `Updated status to "${newStatus}" for selected markups.`, life: 4000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not update status.', life: 4000 });
      },
    });
  }
}

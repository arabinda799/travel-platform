import { ChangeDetectionStrategy, Component, computed, inject, signal, TemplateRef, viewChild } from '@angular/core';
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
  FilterSidebarComponent,
  StatusModalComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  STATUS_OPTIONS,
  BreadcrumbItem,
  ThumbImageComponent,
} from 'admin-core';
import { TrendingDestination, TrendingDestinationsService } from './trending-destinations.service';

@Component({
  selector: 'app-trending-destinations',
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
    FilterSidebarComponent,
    StatusModalComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
    ThumbImageComponent,
  ],
  templateUrl: './trending-destinations.html',
  styleUrl: './trending-destinations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TrendingDestinationsComponent {
  private readonly service = inject(TrendingDestinationsService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hotel', route: '/hotel/bookings' },
    { label: 'Trending Destinations' },
  ];

  readonly destinations = this.service.destinations;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<TrendingDestination[]>([]);
  readonly loading = signal(false);

  // Filter state
  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

  // Modal state
  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly statusModalVisible = signal(false);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<TrendingDestination | null>(null);
  readonly formImageFileName = signal('');

  readonly statusOptions = STATUS_OPTIONS;

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    subtitle: new FormControl('', Validators.maxLength(200)),
    imageUrl: new FormControl(''),
    sortOrder: new FormControl('1', Validators.required),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
  });

  // Table column templates
  readonly imageTpl = viewChild<TemplateRef<unknown>>('imageTpl');
  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'imageUrl', header: 'Image', width: '7rem', bodyTemplate: this.imageTpl() },
    { field: 'name', header: 'Destination Name', sortable: true, width: '14rem', bodyTemplate: this.nameTpl() },
    { field: 'sortOrder', header: 'Sort Order', sortable: true, width: '8rem', align: 'center' },
    { field: 'isActive', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdAt', header: 'Created At', sortable: true, width: '14rem' },
    { field: 'updatedAt', header: 'Updated At', sortable: true, width: '14rem' },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => (this.appliedStatusFilter() ? 1 : 0));

  readonly filteredDestinations = computed(() => {
    let list = this.destinations();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(d =>
        d.name.toLowerCase().includes(q) ||
        (d.subtitle ?? '').toLowerCase().includes(q),
      );
    }
    const sf = this.appliedStatusFilter();
    if (sf) {
      list = list.filter(d => d.isActive === (sf === 'Active'));
    }
    return list;
  });

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({
      name: '',
      subtitle: '',
      imageUrl: '',
      sortOrder: String(this.destinations().length + 1),
      status: 'Active',
    });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(dest: TrendingDestination): void {
    this.isEditing.set(true);
    this.editingId.set(dest.id);
    this.form.patchValue({
      name: dest.name,
      subtitle: dest.subtitle ?? '',
      imageUrl: dest.imageUrl ?? '',
      sortOrder: String(dest.sortOrder),
      status: dest.isActive ? 'Active' : 'Inactive',
    });
    const parts = (dest.imageUrl ?? '').split('/');
    this.formImageFileName.set(parts[parts.length - 1].split('?')[0] || 'Destination Image');
    this.modalVisible.set(true);
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      name: (v.name ?? '').trim(),
      subtitle: (v.subtitle ?? '').trim() || null,
      imageUrl: (v.imageUrl ?? '').trim() || null,
      sortOrder: parseInt(v.sortOrder ?? '1', 10) || 1,
      isActive: v.status === 'Active',
    };
    if (this.isEditing() && this.editingId()) {
      this.service.update(this.editingId()!, payload);
      this.messageService.add({ severity: 'success', summary: 'Destination Updated', detail: `"${payload.name}" updated successfully.` });
    } else {
      this.service.add(payload);
      this.messageService.add({ severity: 'success', summary: 'Destination Added', detail: `"${payload.name}" added to trending destinations.` });
    }
    this.modalVisible.set(false);
  }

  confirmDeleteSingle(dest: TrendingDestination): void {
    this.itemToDelete.set(dest);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedItems().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.service.delete(single.id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${single.name}" deleted successfully.` });
    } else {
      const ids = this.selectedItems().map(d => d.id);
      this.service.bulkDelete(ids);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${ids.length} destinations deleted.` });
      this.selectedItems.set([]);
    }
    this.confirmDeleteVisible.set(false);
    this.itemToDelete.set(null);
  }

  openBulkStatusModal(): void {
    if (this.selectedItems().length > 0) this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const active = newStatus === 'Active';
    this.selectedItems().forEach(d => this.service.updateStatus(d.id, active));
    this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${this.selectedItems().length} destinations set to ${newStatus}.` });
    this.selectedItems.set([]);
    this.statusModalVisible.set(false);
  }
}

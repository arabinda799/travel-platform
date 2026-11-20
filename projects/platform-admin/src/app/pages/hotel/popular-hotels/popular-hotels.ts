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
import { PopularHotel, PopularHotelsService } from './popular-hotels.service';

@Component({
  selector: 'app-popular-hotels',
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
  templateUrl: './popular-hotels.html',
  styleUrl: './popular-hotels.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PopularHotelsComponent {
  private readonly service = inject(PopularHotelsService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hotel', route: '/hotel/bookings' },
    { label: 'Popular Hotels' },
  ];

  readonly hotels = this.service.hotels;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<PopularHotel[]>([]);
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
  readonly itemToDelete = signal<PopularHotel | null>(null);
  readonly formImageFileName = signal('');

  readonly statusOptions = STATUS_OPTIONS;

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(200)]),
    imageUrl: new FormControl(''),
    sortOrder: new FormControl('1', Validators.required),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
  });

  // Table column templates
  readonly imageTpl = viewChild<TemplateRef<unknown>>('imageTpl');
  readonly titleTpl = viewChild<TemplateRef<unknown>>('titleTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'imageUrl', header: 'Image', width: '7rem', bodyTemplate: this.imageTpl() },
    { field: 'title', header: 'Hotel Name', sortable: true, width: '20rem', bodyTemplate: this.titleTpl() },
    { field: 'sortOrder', header: 'Sort Order', sortable: true, width: '8rem', align: 'center' },
    { field: 'isActive', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdAt', header: 'Created At', sortable: true, width: '14rem' },
    { field: 'updatedAt', header: 'Updated At', sortable: true, width: '14rem' },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => (this.appliedStatusFilter() ? 1 : 0));

  readonly filteredHotels = computed(() => {
    let list = this.hotels();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(h => (h.title ?? '').toLowerCase().includes(q));
    }
    const sf = this.appliedStatusFilter();
    if (sf) {
      list = list.filter(h => h.isActive === (sf === 'Active'));
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
      title: '',
      imageUrl: '',
      sortOrder: String(this.hotels().length + 1),
      status: 'Active',
    });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(hotel: PopularHotel): void {
    this.isEditing.set(true);
    this.editingId.set(hotel.id);
    this.form.patchValue({
      title: hotel.title ?? '',
      imageUrl: hotel.imageUrl ?? '',
      sortOrder: String(hotel.sortOrder),
      status: hotel.isActive ? 'Active' : 'Inactive',
    });
    const parts = (hotel.imageUrl ?? '').split('/');
    this.formImageFileName.set(parts[parts.length - 1].split('?')[0] || 'Hotel Image');
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
      title: (v.title ?? '').trim() || null,
      imageUrl: (v.imageUrl ?? '').trim() || null,
      sortOrder: parseInt(v.sortOrder ?? '1', 10) || 1,
      isActive: v.status === 'Active',
    };
    if (this.isEditing() && this.editingId()) {
      this.service.update(this.editingId()!, payload);
      this.messageService.add({ severity: 'success', summary: 'Hotel Updated', detail: `"${payload.title}" updated successfully.` });
    } else {
      this.service.add(payload);
      this.messageService.add({ severity: 'success', summary: 'Hotel Added', detail: `"${payload.title}" added to popular hotels.` });
    }
    this.modalVisible.set(false);
  }

  confirmDeleteSingle(hotel: PopularHotel): void {
    this.itemToDelete.set(hotel);
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
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${single.title}" removed from popular hotels.` });
    } else {
      const ids = this.selectedItems().map(h => h.id);
      this.service.bulkDelete(ids);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${ids.length} hotels deleted.` });
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
    this.selectedItems().forEach(h => this.service.updateStatus(h.id, active));
    this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${this.selectedItems().length} hotels set to ${newStatus}.` });
    this.selectedItems.set([]);
    this.statusModalVisible.set(false);
  }
}

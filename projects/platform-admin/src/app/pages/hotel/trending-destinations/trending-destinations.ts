import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, SelectFieldComponent,
  FileUploadFieldComponent, FilterSidebarComponent, StatusModalComponent,
  ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  TableColumn, STATUS_OPTIONS, BreadcrumbItem, ThumbImageComponent,
} from 'admin-core';
import { TrendingDestination, TrendingDestinationsService } from './trending-destinations.service';

@Component({
  selector: 'app-trending-destinations',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    FileUploadFieldComponent, FilterSidebarComponent, StatusModalComponent,
    ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
    ThumbImageComponent,
  ],
  templateUrl: './trending-destinations.html',
  styleUrl: './trending-destinations.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingDestinationsComponent implements OnInit {
  private readonly service = inject(TrendingDestinationsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Hotel', route: '/hotel/bookings' },
    { label: 'Trending Destinations' },
  ];

  readonly destinations = this.service.destinations;
  readonly loading = this.service.loading;
  readonly searchQuery = signal('');
  readonly selectedItems = signal<TrendingDestination[]>([]);
  readonly isSaving = signal(false);

  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

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
    if (q) list = list.filter(d => d.name.toLowerCase().includes(q) || (d.subtitle ?? '').toLowerCase().includes(q));
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(d => d.isActive === (sf === 'Active'));
    return list;
  });

  ngOnInit(): void { this.service.load(); }

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void { this.appliedStatusFilter.set(this.selectedStatusFilter()); this.filterVisible.set(false); }

  onResetFilters(): void { this.selectedStatusFilter.set(null); this.appliedStatusFilter.set(null); this.filterVisible.set(false); }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', subtitle: '', imageUrl: '', sortOrder: String(this.destinations().length + 1), status: 'Active' });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(dest: TrendingDestination): void {
    this.isEditing.set(true);
    this.editingId.set(dest.id);
    this.form.patchValue({ name: dest.name, subtitle: dest.subtitle ?? '', imageUrl: dest.imageUrl ?? '', sortOrder: String(dest.sortOrder), status: dest.isActive ? 'Active' : 'Inactive' });
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
    this.isSaving.set(true);
    const obs$ = this.isEditing() && this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.add(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        const label = this.isEditing() ? 'Destination Updated' : 'Destination Added';
        const detail = this.isEditing() ? `"${result.name}" updated successfully.` : `"${result.name}" added to trending destinations.`;
        this.messageService.add({ severity: 'success', summary: label, detail });
        this.modalVisible.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save destination.' });
      },
    });
  }

  confirmDeleteSingle(dest: TrendingDestination): void { this.itemToDelete.set(dest); this.confirmDeleteVisible.set(true); }

  confirmBulkDelete(): void {
    if (this.selectedItems().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single ? this.service.delete(single.id) : this.service.bulkDelete(this.selectedItems().map(d => d.id));
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${single.name}" deleted successfully.` });
        } else {
          const count = this.selectedItems().length;
          this.selectedItems.set([]);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${count} destinations deleted.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete destination.' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }

  openBulkStatusModal(): void {
    if (this.selectedItems().length > 0) this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const active = newStatus === 'Active';
    this.selectedItems().forEach(d => {
      this.service.updateStatus(d.id, active).pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    });
    this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${this.selectedItems().length} destinations set to ${newStatus}.` });
    this.selectedItems.set([]);
    this.statusModalVisible.set(false);
  }
}

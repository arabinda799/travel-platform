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
  ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  TableColumn, TableLazyEvent,
} from 'admin-core';
import { PopularHotel, PopularHotelService } from './popular-hotel.service';

@Component({
  selector: 'app-popular-hotel-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './popular-hotel-list.html',
  styleUrl: './popular-hotel-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularHotelListComponent implements OnInit {
  readonly service = inject(PopularHotelService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<PopularHotel | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', Validators.required),
    imageUrl: new FormControl(''),
    sortOrder: new FormControl<number>(1, Validators.required),
    isActive: new FormControl<boolean>(true, Validators.required),
  });

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.service.hotels();
    return this.service.hotels().filter(h => (h.title ?? '').toLowerCase().includes(q));
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'image', header: 'Image', width: '6rem', bodyTemplate: this.imageTpl() },
    { field: 'title', header: 'Hotel Name', width: '18rem', sortable: true },
    { field: 'sortOrder', header: 'Order', width: '7rem', align: 'center' },
    { field: 'status', header: 'Status', width: '8rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '8rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  ngOnInit(): void { this.service.load(); }

  onSearch(q: string): void { this.searchQuery.set(q); }

  onLazyLoad(e: TableLazyEvent): void {
    const page = Math.floor((e.first ?? 0) / (e.rows ?? 50)) + 1;
    if (page !== this.service.page()) this.service.goToPage(page);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ title: '', imageUrl: '', sortOrder: 1, isActive: true });
    this.modalVisible.set(true);
  }

  openEditModal(item: PopularHotel): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ title: item.title ?? '', imageUrl: item.imageUrl ?? '', sortOrder: item.sortOrder, isActive: item.isActive });
    this.modalVisible.set(true);
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = { title: v.title!.trim(), imageUrl: v.imageUrl?.trim() || null, sortOrder: Number(v.sortOrder), isActive: v.isActive! };
    const obs = this.isEditing() && this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.add(payload);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: this.isEditing() ? 'Updated' : 'Created', detail: `"${payload.title}" saved.` }); this.modalVisible.set(false); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save.' }),
    });
  }

  confirmDelete(item: PopularHotel): void { this.itemToDelete.set(item); this.confirmDeleteVisible.set(true); }

  executeDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${item.title}" deleted.` }); this.confirmDeleteVisible.set(false); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
    });
  }
}

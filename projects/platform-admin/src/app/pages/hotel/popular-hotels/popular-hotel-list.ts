import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, SelectFieldComponent, FileUploadFieldComponent,
  ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  TableColumn, TableLazyEvent,
  HotelAutocompleteService, AutocompleteHotel,
} from 'admin-core';
import { PopularHotel, PopularHotelService } from './popular-hotel.service';

@Component({
  selector: 'app-popular-hotel-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent, FileUploadFieldComponent,
    ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './popular-hotel-list.html',
  styleUrl: './popular-hotel-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopularHotelListComponent implements OnInit {
  readonly service = inject(PopularHotelService);
  private readonly autocompleteService = inject(HotelAutocompleteService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly modalVisible = signal(false);
  readonly isSaving = signal(false);
  readonly formImageFileName = signal('');
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<PopularHotel | null>(null);

  // RateHawk Hotel Autocomplete
  readonly hotelSearchQuery = signal('');
  readonly searchingHotels = signal(false);
  readonly hotelSuggestions = signal<AutocompleteHotel[]>([]);

  onHotelSearchInput(term: string): void {
    const q = (term || '').trim();
    this.hotelSearchQuery.set(term);
    if (q.length < 2) {
      this.hotelSuggestions.set([]);
      return;
    }
    this.searchingHotels.set(true);
    this.autocompleteService.searchHotels(q).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: hotels => {
        this.hotelSuggestions.set(hotels);
        this.searchingHotels.set(false);
      },
      error: () => {
        this.hotelSuggestions.set([]);
        this.searchingHotels.set(false);
      },
    });
  }

  selectHotel(hotel: AutocompleteHotel): void {
    this.form.controls.title.setValue(hotel.name);
    this.hotelSearchQuery.set(hotel.name);
    this.hotelSuggestions.set([]);
  }

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
    this.formImageFileName.set('');
    this.hotelSearchQuery.set('');
    this.hotelSuggestions.set([]);
    this.modalVisible.set(true);
  }

  openEditModal(item: PopularHotel): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ title: item.title ?? '', imageUrl: item.imageUrl ?? '', sortOrder: item.sortOrder, isActive: item.isActive });
    this.formImageFileName.set('');
    this.hotelSearchQuery.set(item.title ?? '');
    this.hotelSuggestions.set([]);
    this.modalVisible.set(true);
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const payload = { title: v.title!.trim(), imageUrl: v.imageUrl?.trim() || null, sortOrder: Number(v.sortOrder), isActive: v.isActive! };
    const obs = this.isEditing() && this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.add(payload);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'success', summary: this.isEditing() ? 'Updated' : 'Created', detail: `"${payload.title}" saved.` });
        this.modalVisible.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save.' });
      },
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

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
  HotelAutocompleteService, AutocompleteCity,
} from 'admin-core';
import { TrendingDestination, TrendingDestinationService } from './trending-destination.service';

@Component({
  selector: 'app-trending-destination-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent, FileUploadFieldComponent,
    ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './trending-destination-list.html',
  styleUrl: './trending-destination-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TrendingDestinationListComponent implements OnInit {
  readonly service = inject(TrendingDestinationService);
  private readonly autocompleteService = inject(HotelAutocompleteService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly modalVisible = signal(false);
  readonly isSaving = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<TrendingDestination | null>(null);
  readonly formImageFileName = signal('');

  // RateHawk Region Autocomplete
  readonly destinationSearchQuery = signal('');
  readonly searchingDestinations = signal(false);
  readonly destinationSuggestions = signal<AutocompleteCity[]>([]);

  onDestinationSearchInput(term: string): void {
    const q = (term || '').trim();
    this.destinationSearchQuery.set(term);
    if (q.length < 2) {
      this.destinationSuggestions.set([]);
      return;
    }
    this.searchingDestinations.set(true);
    this.autocompleteService.searchCities(q).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: cities => {
        this.destinationSuggestions.set(cities);
        this.searchingDestinations.set(false);
      },
      error: () => {
        this.destinationSuggestions.set([]);
        this.searchingDestinations.set(false);
      },
    });
  }

  selectDestination(city: AutocompleteCity): void {
    this.form.controls.name.setValue(city.name);
    const sub = city.hotelsCount
      ? `${city.hotelsCount.toLocaleString()} properties in ${city.country}`
      : city.country;
    this.form.controls.subtitle.setValue(sub);
    this.destinationSearchQuery.set(`${city.name}, ${city.country}`);
    this.destinationSuggestions.set([]);
  }

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    subtitle: new FormControl(''),
    imageUrl: new FormControl(''),
    sortOrder: new FormControl<number>(1, Validators.required),
    isActive: new FormControl<boolean>(true, Validators.required),
  });

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.service.destinations();
    return this.service.destinations().filter(d => d.name.toLowerCase().includes(q));
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'image', header: 'Image', width: '6rem', bodyTemplate: this.imageTpl() },
    { field: 'name', header: 'Name', width: '14rem', sortable: true },
    { field: 'subtitle', header: 'Subtitle', width: '14rem' },
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
    this.form.reset({ name: '', subtitle: '', imageUrl: '', sortOrder: 1, isActive: true });
    this.formImageFileName.set('');
    this.destinationSearchQuery.set('');
    this.destinationSuggestions.set([]);
    this.modalVisible.set(true);
  }

  openEditModal(item: TrendingDestination): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ name: item.name, subtitle: item.subtitle ?? '', imageUrl: item.imageUrl ?? '', sortOrder: item.sortOrder, isActive: item.isActive });
    this.formImageFileName.set('');
    this.destinationSearchQuery.set(item.name);
    this.destinationSuggestions.set([]);
    this.modalVisible.set(true);
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSaving.set(true);
    const v = this.form.getRawValue();
    const payload = { name: v.name!.trim(), subtitle: v.subtitle?.trim() || null, imageUrl: v.imageUrl?.trim() || null, sortOrder: Number(v.sortOrder), isActive: v.isActive! };
    const obs = this.isEditing() && this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.add(payload);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'success', summary: this.isEditing() ? 'Updated' : 'Created', detail: `"${payload.name}" saved.` });
        this.modalVisible.set(false);
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save.' });
      },
    });
  }

  confirmDelete(item: TrendingDestination): void { this.itemToDelete.set(item); this.confirmDeleteVisible.set(true); }

  executeDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${item.name}" deleted.` }); this.confirmDeleteVisible.set(false); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
    });
  }
}

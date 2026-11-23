import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
  TemplateRef, viewChild, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, SelectFieldComponent,
  TextareaFieldComponent, FileUploadFieldComponent, DatePickerFieldComponent,
  FilterSidebarComponent, StatusModalComponent, ConfirmDialogComponent,
  StatusBadgeComponent, TableActionComponent, TableColumn,
  generateSlug, STATUS_OPTIONS, META_ROBOTS_OPTIONS, ThumbImageComponent,
} from 'admin-core';
import { BlogCategory, BlogCategoryService } from './blog-category.service';

@Component({
  selector: 'app-blog-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    TextareaFieldComponent, FileUploadFieldComponent, DatePickerFieldComponent,
    FilterSidebarComponent, StatusModalComponent, ConfirmDialogComponent,
    StatusBadgeComponent, TableActionComponent, ThumbImageComponent,
  ],
  templateUrl: './blog-categories.html',
  styleUrl: './blog-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogCategoriesComponent implements OnInit {
  private readonly categoryService = inject(BlogCategoryService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly categories = this.categoryService.categories;
  readonly loading = this.categoryService.loading;
  readonly searchQuery = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  readonly selectedCategories = signal<BlogCategory[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<Date[] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<Date[] | null>(null);

  readonly statusModalVisible = signal<boolean>(false);
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  private slugManuallyEdited = false;
  readonly formImageFileName = signal<string>('');
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<BlogCategory | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    slug: new FormControl('', Validators.required),
    image: new FormControl('', Validators.required),
    status: new FormControl<'Active' | 'Inactive'>('Active'),
    description: new FormControl('', Validators.required),
    metaRobots: new FormControl('INDEX, FOLLOW', Validators.required),
    metaTitle: new FormControl('', Validators.required),
    metaKeyword: new FormControl(''),
    metaDescription: new FormControl(''),
  });

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly titleTpl = viewChild<TemplateRef<any>>('titleTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = STATUS_OPTIONS;
  readonly filterStatusOptions = STATUS_OPTIONS;
  readonly robotsOptions = META_ROBOTS_OPTIONS;

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'image', header: 'Category Image', width: '7.5rem', bodyTemplate: this.imageTpl() },
    { field: 'name', header: 'Category Title', width: '24rem', sortable: true, bodyTemplate: this.titleTpl() },
    { field: 'status', header: 'Status', width: '8rem', sortable: true, align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdAt', header: 'Created Date', width: '13rem', sortable: true },
    { field: 'modifiedAt', header: 'Modified Date', width: '11rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedDateRangeFilter()?.[0]) count++;
    return count;
  });

  readonly filteredCategories = computed(() => {
    let list = this.categories();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) list = list.filter(item => item.name.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query));
    const statusFilter = this.appliedStatusFilter();
    if (statusFilter) list = list.filter(item => item.status === statusFilter);
    return list;
  });

  ngOnInit(): void { this.categoryService.load(); }

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null); this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null); this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openBulkStatusModal(): void { if (this.selectedCategories().length > 0) this.statusModalVisible.set(true); }

  onBulkStatusConfirm(newStatus: string): void {
    const status = newStatus as 'Active' | 'Inactive';
    const updates$ = this.selectedCategories().map(cat =>
      this.categoryService.updateStatus(cat.id, status)
    );
    // fire all, listen to last
    updates$.forEach(obs$ =>
      obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    );
    this.messageService.add({ severity: 'success', summary: 'Status Updated', detail: `${this.selectedCategories().length} categories updated to ${status}` });
    this.selectedCategories.set([]);
    this.statusModalVisible.set(false);
  }

  onNameBlur(): void {
    if (!this.slugManuallyEdited && this.form.controls.name.value) {
      this.form.controls.slug.setValue(generateSlug(this.form.controls.name.value));
    }
  }

  onSlugInput(): void { this.slugManuallyEdited = true; }

  openAddModal(): void {
    this.isEditing.set(false); this.editingId.set(null); this.slugManuallyEdited = false;
    this.form.reset({ name: '', slug: '', image: '', status: 'Active', description: '', metaRobots: 'INDEX, FOLLOW', metaTitle: '', metaKeyword: '', metaDescription: '' });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(category: BlogCategory): void {
    this.isEditing.set(true); this.editingId.set(category.id); this.slugManuallyEdited = true;
    this.form.patchValue({ name: category.name, slug: category.slug, image: category.image, status: category.status, description: category.description, metaRobots: category.metaRobots || 'INDEX, FOLLOW', metaTitle: category.metaTitle || category.name, metaKeyword: category.metaKeyword || '', metaDescription: category.metaDescription || '' });
    const parts = (category.image || '').split('/');
    this.formImageFileName.set(parts[parts.length - 1].split('?')[0] || 'Cover Image');
    this.modalVisible.set(true);
  }

  onSaveCategory(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Required Fields Missing', detail: 'Please fill in all asterisk (*) marked fields.', life: 5000 });
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      name: v.name!.trim(), slug: v.slug!.trim(), image: v.image!.trim(),
      status: v.status!, description: v.description!.trim(),
      metaRobots: v.metaRobots!, metaTitle: v.metaTitle!.trim() || v.name!.trim(),
      metaKeyword: v.metaKeyword?.trim() ?? '', metaDescription: v.metaDescription?.trim() ?? '',
    };
    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.categoryService.updateCategory(id, payload) : this.categoryService.addCategory(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: id ? 'Category Updated' : 'Category Created', detail: id ? 'Category has been updated successfully.' : 'New category has been added successfully.' });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err?.error?.message || 'Could not save category.' });
        this.isSaving.set(false);
      },
    });
  }

  confirmDeleteSingle(category: BlogCategory): void { this.itemToDelete.set(category); this.confirmDeleteVisible.set(true); }
  confirmBulkDelete(): void { this.itemToDelete.set(null); this.confirmDeleteVisible.set(true); }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.categoryService.deleteCategory(single.id)
      : this.categoryService.deleteMultiple(this.selectedCategories().map(c => c.id));
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.selectedCategories.update(list => list.filter(c => c.id !== single.id));
          this.messageService.add({ severity: 'success', summary: 'Category Deleted', detail: `Category "${single.name}" was deleted.` });
        } else {
          const count = this.selectedCategories().length;
          this.selectedCategories.set([]);
          this.messageService.add({ severity: 'success', summary: 'Categories Deleted', detail: `${count} categories have been deleted.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete category.' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }
}

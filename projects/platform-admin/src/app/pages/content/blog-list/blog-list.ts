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
import { BlogPost, BlogService } from './blog.service';
import { BlogCategoryService } from '../blog-categories/blog-category.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    TextareaFieldComponent, FileUploadFieldComponent, DatePickerFieldComponent,
    FilterSidebarComponent, StatusModalComponent, ConfirmDialogComponent,
    StatusBadgeComponent, TableActionComponent, ThumbImageComponent,
  ],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit {
  private readonly blogService = inject(BlogService);
  private readonly categoryService = inject(BlogCategoryService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly blogs = this.blogService.blogs;
  readonly categories = this.categoryService.categories;
  readonly loading = this.blogService.loading;
  readonly searchQuery = signal<string>('');
  readonly isSaving = signal<boolean>(false);
  readonly selectedBlogs = signal<BlogPost[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedCategoryFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<Date[] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedCategoryFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<Date[] | null>(null);

  readonly statusModalVisible = signal<boolean>(false);
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  private slugManuallyEdited = false;
  readonly formImageFileName = signal<string>('');
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<BlogPost | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', Validators.required),
    slug: new FormControl('', Validators.required),
    categoryId: new FormControl('', Validators.required),
    image: new FormControl('', Validators.required),
    description: new FormControl('', Validators.required),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
    postedBy: new FormControl('Admin', Validators.required),
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
  readonly metaRobotsOptions = META_ROBOTS_OPTIONS;

  readonly categoryOptions = computed(() =>
    this.categories().map(c => ({ label: c.name, value: c.id }))
  );

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedCategoryFilter()) count++;
    if (this.appliedDateRangeFilter()?.[0]) count++;
    return count;
  });

  readonly filteredBlogs = computed(() => {
    let list = this.blogs();
    const statusFilter = this.appliedStatusFilter();
    if (statusFilter) list = list.filter(b => b.status === statusFilter);
    const categoryFilter = this.appliedCategoryFilter();
    if (categoryFilter) list = list.filter(b => b.categoryId === categoryFilter);
    const query = this.searchQuery().trim().toLowerCase();
    if (query) list = list.filter(b => b.title.toLowerCase().includes(query) || b.slug.toLowerCase().includes(query) || b.categoryName.toLowerCase().includes(query) || b.postedBy.toLowerCase().includes(query));
    return list;
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'image', header: 'Blog Image', width: '7.5rem', bodyTemplate: this.imageTpl() },
    { field: 'title', header: 'Blog Title', width: '20rem', sortable: true, bodyTemplate: this.titleTpl() },
    { field: 'categoryName', header: 'Category', width: '16rem', sortable: true },
    { field: 'status', header: 'Status', width: '8rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'postedBy', header: 'Posted By', width: '10rem', sortable: true },
    { field: 'createdAt', header: 'Created Date', width: '12.5rem', sortable: true },
    { field: 'modifiedAt', header: 'Modified Date', width: '12.5rem', sortable: true },
    { field: 'actions', header: 'Action', width: '6.5rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  ngOnInit(): void {
    this.blogService.load();
    this.categoryService.load();
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  applyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedCategoryFilter.set(this.selectedCategoryFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  resetFilters(): void {
    this.selectedStatusFilter.set(null); this.selectedCategoryFilter.set(null); this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null); this.appliedCategoryFilter.set(null); this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  onTitleBlur(): void {
    if (!this.slugManuallyEdited && this.form.controls.title.value) {
      this.form.controls.slug.setValue(generateSlug(this.form.controls.title.value));
    }
  }

  onSlugBlur(): void {
    this.slugManuallyEdited = true;
    if (this.form.controls.slug.value) this.form.controls.slug.setValue(generateSlug(this.form.controls.slug.value));
  }

  openAddModal(): void {
    this.isEditing.set(false); this.editingId.set(null); this.slugManuallyEdited = false;
    this.form.reset({ title: '', slug: '', categoryId: '', image: '', description: '', status: 'Active', postedBy: 'Admin', metaRobots: 'INDEX, FOLLOW', metaTitle: '', metaKeyword: '', metaDescription: '' });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(item: BlogPost): void {
    this.isEditing.set(true); this.editingId.set(item.id); this.slugManuallyEdited = true;
    this.form.patchValue({ title: item.title, slug: item.slug, categoryId: item.categoryId, image: item.image, description: item.description, status: item.status, postedBy: item.postedBy, metaRobots: item.metaRobots || 'INDEX, FOLLOW', metaTitle: item.metaTitle || item.title, metaKeyword: item.metaKeyword || '', metaDescription: item.metaDescription || '' });
    this.formImageFileName.set(item.image ? item.image.split('/').pop()?.split('?')[0] || 'Current Image' : '');
    this.modalVisible.set(true);
  }

  saveBlog(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Required Fields Missing', detail: 'Please fill in all required fields before saving.' });
      return;
    }
    const v = this.form.getRawValue();
    const selectedCategory = this.categories().find(c => c.id === v.categoryId);
    const payload = {
      title: (v.title || '').trim(), slug: (v.slug || '').trim(),
      categoryId: v.categoryId || '', categoryName: selectedCategory?.name ?? '',
      image: (v.image || '').trim(), description: (v.description || '').trim(),
      status: (v.status || 'Active') as 'Active' | 'Inactive',
      postedBy: (v.postedBy || 'Admin').trim(),
      metaRobots: (v.metaRobots || 'INDEX, FOLLOW').trim(),
      metaTitle: (v.metaTitle || '').trim(), metaKeyword: (v.metaKeyword || '').trim(),
      metaDescription: (v.metaDescription || '').trim(),
    };
    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.blogService.updateBlog(id, payload) : this.blogService.addBlog(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.messageService.add({ severity: 'success', summary: id ? 'Updated' : 'Created', detail: `Blog post "${result.title}" has been ${id ? 'updated' : 'added'}.` });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err?.error?.message || 'Could not save blog post.' });
        this.isSaving.set(false);
      },
    });
  }

  openBulkStatusModal(): void { if (this.selectedBlogs().length > 0) this.statusModalVisible.set(true); }

  onBulkStatusConfirm(newStatus: string): void {
    const status = newStatus as 'Active' | 'Inactive';
    this.selectedBlogs().forEach(b =>
      this.blogService.updateStatus(b.id, status).pipe(takeUntilDestroyed(this.destroyRef)).subscribe()
    );
    this.messageService.add({ severity: 'info', summary: 'Status Updated', detail: `Updated status to ${status} for ${this.selectedBlogs().length} blog post(s).` });
    this.selectedBlogs.set([]);
    this.statusModalVisible.set(false);
  }

  confirmDelete(item: BlogPost): void { this.itemToDelete.set(item); this.confirmDeleteVisible.set(true); }
  confirmBulkDelete(): void { this.itemToDelete.set(null); this.confirmDeleteVisible.set(true); }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.blogService.deleteBlog(single.id)
      : this.blogService.bulkDelete(this.selectedBlogs().map(b => b.id));
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `Blog post "${single.title}" was deleted.` });
        } else {
          const count = this.selectedBlogs().length;
          this.selectedBlogs.set([]);
          this.messageService.add({ severity: 'success', summary: 'Bulk Deleted', detail: `${count} blog post(s) were deleted.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete blog post(s).' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }
}

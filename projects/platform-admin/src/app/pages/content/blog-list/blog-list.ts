import { ChangeDetectionStrategy, Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild, } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  FileUploadFieldComponent,
  DatePickerFieldComponent,
  FilterSidebarComponent,
  StatusModalComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  generateSlug,
  STATUS_OPTIONS,
  META_ROBOTS_OPTIONS,
  ThumbImageComponent,
} from 'admin-core';
import { BlogPost, BlogService } from './blog.service';
import { BlogCategoryService } from '../blog-categories/blog-category.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    FileUploadFieldComponent,
    DatePickerFieldComponent,
    FilterSidebarComponent,
    StatusModalComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
    ThumbImageComponent,
  ],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogListComponent {
  private readonly blogService = inject(BlogService);
  private readonly categoryService = inject(BlogCategoryService);
  private readonly messageService = inject(MessageService);

  readonly blogs = this.blogService.blogs;
  readonly categories = this.categoryService.categories;
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedBlogs = signal<BlogPost[]>([]);

  // Filter Drawer State
  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedCategoryFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<Date[] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedCategoryFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<Date[] | null>(null);

  // Status Change Modal State
  readonly statusModalVisible = signal<boolean>(false);

  // Form Modal State (Add / Edit)
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  private slugManuallyEdited = false;

  // Display-only signal for uploaded file name
  readonly formImageFileName = signal<string>('');

  // Reactive Form (Matching BlogCategoriesComponent standard)
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

  // Confirmation Dialog State
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<BlogPost | null>(null);

  // Template Refs
  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly titleTpl = viewChild<TemplateRef<any>>('titleTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = STATUS_OPTIONS;
  readonly metaRobotsOptions = META_ROBOTS_OPTIONS;

  readonly categoryOptions = computed(() =>
    this.categories().map(c => ({ label: c.name, value: c.id })),
  );

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedCategoryFilter()) count++;
    const range = this.appliedDateRangeFilter();
    if (range && range.length > 0 && range[0]) count++;
    return count;
  });

  readonly filteredBlogs = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const statusFilter = this.appliedStatusFilter();
    const categoryFilter = this.appliedCategoryFilter();
    const dateRange = this.appliedDateRangeFilter();

    let list = this.blogs();

    if (statusFilter) {
      list = list.filter(b => b.status === statusFilter);
    }

    if (categoryFilter) {
      list = list.filter(b => b.categoryId === categoryFilter);
    }

    if (dateRange && dateRange.length > 0 && dateRange[0]) {
      const start = new Date(dateRange[0]);
      start.setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]) : new Date(start);
      end.setHours(23, 59, 59, 999);

      list = list.filter(b => {
        const datePart = b.createdAt.split(' / ')[0];
        const itemDate = new Date(datePart);
        if (isNaN(itemDate.getTime())) return true;
        return itemDate >= start && itemDate <= end;
      });
    }

    if (!query) return list;

    return list.filter(
      b =>
        b.title.toLowerCase().includes(query) ||
        b.slug.toLowerCase().includes(query) ||
        b.categoryName.toLowerCase().includes(query) ||
        b.postedBy.toLowerCase().includes(query),
    );
  });

  readonly columns = computed<TableColumn[]>(() => [
    {
      field: 'image',
      header: 'Blog Image',
      width: '7.5rem',
      bodyTemplate: this.imageTpl(),
    },
    {
      field: 'title',
      header: 'Blog Title',
      width: '20rem',
      sortable: true,
      bodyTemplate: this.titleTpl(),
    },
    {
      field: 'categoryName',
      header: 'Category',
      width: '16rem',
      sortable: true,
    },
    {
      field: 'status',
      header: 'Status',
      width: '8rem',
      align: 'center',
      sortable: true,
      bodyTemplate: this.statusTpl(),
    },
    {
      field: 'postedBy',
      header: 'Posted By',
      width: '10rem',
      sortable: true,
    },
    {
      field: 'createdAt',
      header: 'Created Date',
      width: '12.5rem',
      sortable: true,
    },
    {
      field: 'modifiedAt',
      header: 'Modified Date',
      width: '12.5rem',
      sortable: true,
    },
    {
      field: 'actions',
      header: 'Action',
      width: '6.5rem',
      align: 'center',
      frozen: true,
      frozenAlign: 'right',
      bodyTemplate: this.actionsTpl(),
    },
  ]);

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onTitleBlur(): void {
    if (!this.slugManuallyEdited && this.form.controls.title.value) {
      this.form.controls.slug.setValue(generateSlug(this.form.controls.title.value));
    }
  }

  onSlugBlur(): void {
    this.slugManuallyEdited = true;
    if (this.form.controls.slug.value) {
      this.form.controls.slug.setValue(generateSlug(this.form.controls.slug.value));
    }
  }

  applyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedCategoryFilter.set(this.selectedCategoryFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  resetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedCategoryFilter.set(null);
    this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedCategoryFilter.set(null);
    this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.slugManuallyEdited = false;

    this.form.reset({
      title: '',
      slug: '',
      categoryId: '',
      image: '',
      description: '',
      status: 'Active',
      postedBy: 'Admin',
      metaRobots: 'INDEX, FOLLOW',
      metaTitle: '',
      metaKeyword: '',
      metaDescription: '',
    });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(item: BlogPost): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.slugManuallyEdited = true;

    this.form.patchValue({
      title: item.title,
      slug: item.slug,
      categoryId: item.categoryId,
      image: item.image,
      description: item.description,
      status: item.status,
      postedBy: item.postedBy,
      metaRobots: item.metaRobots || 'INDEX, FOLLOW',
      metaTitle: item.metaTitle || item.title,
      metaKeyword: item.metaKeyword || '',
      metaDescription: item.metaDescription || '',
    });
    this.formImageFileName.set(
      item.image ? item.image.split('/').pop()?.split('?')[0] || 'Current Image' : '',
    );
    this.modalVisible.set(true);
  }

  saveBlog(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Required Fields Missing',
        detail: 'Please fill in all required fields before saving.',
      });
      return;
    }

    const v = this.form.getRawValue();
    const selectedCategory = this.categories().find(c => c.id === v.categoryId);

    const payload = {
      title: (v.title || '').trim(),
      slug: (v.slug || '').trim(),
      categoryId: v.categoryId || '',
      categoryName: selectedCategory?.name ?? '',
      image: (v.image || '').trim(),
      description: (v.description || '').trim(),
      status: (v.status || 'Active') as 'Active' | 'Inactive',
      postedBy: (v.postedBy || 'Admin').trim(),
      metaRobots: (v.metaRobots || 'INDEX, FOLLOW').trim(),
      metaTitle: (v.metaTitle || '').trim(),
      metaKeyword: (v.metaKeyword || '').trim(),
      metaDescription: (v.metaDescription || '').trim(),
    };

    if (this.isEditing() && this.editingId()) {
      this.blogService.updateBlog(this.editingId()!, payload);
      this.messageService.add({
        severity: 'success',
        summary: 'Updated',
        detail: `Blog post "${payload.title}" has been updated.`,
      });
    } else {
      this.blogService.addBlog(payload);
      this.messageService.add({
        severity: 'success',
        summary: 'Created',
        detail: `Blog post "${payload.title}" has been added.`,
      });
    }

    this.modalVisible.set(false);
  }

  openBulkStatusModal(): void {
    if (this.selectedBlogs().length === 0) return;
    this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const selected = this.selectedBlogs();
    const status = newStatus as 'Active' | 'Inactive';
    selected.forEach(item => {
      this.blogService.updateStatus(item.id, status);
    });
    this.selectedBlogs.set([]);
    this.statusModalVisible.set(false);
    this.messageService.add({
      severity: 'info',
      summary: 'Status Updated',
      detail: `Updated status to ${status} for ${selected.length} blog post(s).`,
    });
  }

  confirmDelete(item: BlogPost): void {
    this.itemToDelete.set(item);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.blogService.deleteBlog(single.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Deleted',
        detail: `Blog post "${single.title}" was deleted.`,
      });
    } else {
      const selectedIds = this.selectedBlogs().map(b => b.id);
      this.blogService.deleteMultiple(selectedIds);
      this.selectedBlogs.set([]);
      this.messageService.add({
        severity: 'success',
        summary: 'Bulk Deleted',
        detail: `${selectedIds.length} blog post(s) were deleted.`,
      });
    }
    this.confirmDeleteVisible.set(false);
  }
}

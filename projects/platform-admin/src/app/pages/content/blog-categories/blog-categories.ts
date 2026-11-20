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
import { BlogCategory, BlogCategoryService } from './blog-category.service';

@Component({
  selector: 'app-blog-categories',
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
  templateUrl: './blog-categories.html',
  styleUrl: './blog-categories.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BlogCategoriesComponent {
  private readonly categoryService = inject(BlogCategoryService);
  private readonly messageService = inject(MessageService);

  readonly categories = this.categoryService.categories;
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedCategories = signal<BlogCategory[]>([]);

  // Filter Drawer State
  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<Date[] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<Date[] | null>(null);

  // Status Change Modal State
  readonly statusModalVisible = signal<boolean>(false);

  // Form Modal State (Add / Edit)
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  // Track if slug was manually edited by user
  private slugManuallyEdited = false;

  // Display-only signal (not part of form data)
  readonly formImageFileName = signal<string>('');

  // Reactive Form
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

  // Confirmation Dialog State
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<BlogCategory | null>(null);

  // Template Refs
  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly titleTpl = viewChild<TemplateRef<any>>('titleTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = STATUS_OPTIONS;
  readonly filterStatusOptions = STATUS_OPTIONS;
  readonly robotsOptions = META_ROBOTS_OPTIONS;

  readonly columns = computed<TableColumn[]>(() => [
    {
      field: 'image',
      header: 'Category Image',
      width: '7.5rem',
      bodyTemplate: this.imageTpl(),
    },
    {
      field: 'name',
      header: 'Category Title',
      width: '24rem',
      sortable: true,
      bodyTemplate: this.titleTpl(),
    },
    {
      field: 'status',
      header: 'Status',
      width: '8rem',
      sortable: true,
      align: 'center',
      bodyTemplate: this.statusTpl(),
    },
    {
      field: 'createdAt',
      header: 'Created Date',
      width: '13rem',
      sortable: true,
    },
    {
      field: 'modifiedAt',
      header: 'Modified Date',
      width: '11rem',
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

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedDateRangeFilter() && this.appliedDateRangeFilter()![0]) count++;
    return count;
  });

  readonly filteredCategories = computed(() => {
    let list = this.categories();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(
        item =>
          item.name.toLowerCase().includes(query) ||
          item.slug.toLowerCase().includes(query) ||
          item.status.toLowerCase().includes(query)
      );
    }

    const statusFilter = this.appliedStatusFilter();
    if (statusFilter) {
      list = list.filter(item => item.status === statusFilter);
    }

    const dateRange = this.appliedDateRangeFilter();
    if (dateRange && dateRange[0]) {
      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]).setHours(23, 59, 59, 999) : new Date(dateRange[0]).setHours(23, 59, 59, 999);

      list = list.filter(item => {
        const itemDate = new Date(item.createdAt.split('/')[0].trim()).getTime();
        return isNaN(itemDate) || (itemDate >= start && itemDate <= end);
      });
    }

    return list;
  });

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openBulkStatusModal(): void {
    if (this.selectedCategories().length > 0) {
      this.statusModalVisible.set(true);
    }
  }

  onBulkStatusConfirm(newStatus: string): void {
    const statusVal = newStatus as 'Active' | 'Inactive';
    this.selectedCategories().forEach(cat => {
      this.categoryService.updateStatus(cat.id, statusVal);
    });
    this.messageService.add({
      severity: 'success',
      summary: 'Status Updated',
      detail: `${this.selectedCategories().length} categories updated to ${statusVal}`,
    });
    this.selectedCategories.set([]);
    this.statusModalVisible.set(false);
  }

  onNameBlur(): void {
    if (!this.slugManuallyEdited && this.form.controls.name.value) {
      this.form.controls.slug.setValue(generateSlug(this.form.controls.name.value));
    }
  }

  onSlugInput(): void {
    this.slugManuallyEdited = true;
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.slugManuallyEdited = false;
    this.form.reset({
      name: '',
      slug: '',
      image: '',
      status: 'Active',
      description: '',
      metaRobots: 'INDEX, FOLLOW',
      metaTitle: '',
      metaKeyword: '',
      metaDescription: '',
    });
    this.formImageFileName.set('');
    this.modalVisible.set(true);
  }

  openEditModal(category: BlogCategory): void {
    this.isEditing.set(true);
    this.editingId.set(category.id);
    this.slugManuallyEdited = true;
    this.form.patchValue({
      name: category.name,
      slug: category.slug,
      image: category.image,
      status: category.status,
      description: category.description,
      metaRobots: category.metaRobots || 'INDEX, FOLLOW',
      metaTitle: category.metaTitle || category.name,
      metaKeyword: category.metaKeyword || '',
      metaDescription: category.metaDescription || '',
    });
    const parts = (category.image || '').split('/');
    this.formImageFileName.set(parts[parts.length - 1].split('?')[0] || 'Cover Image');
    this.modalVisible.set(true);
  }

  onSaveCategory(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: 'Required Fields Missing',
        detail: 'Please fill in all asterisk (*) marked fields.',
        life: 5000,
      });
      return;
    }

    const v = this.form.getRawValue();

    if (this.isEditing() && this.editingId()) {
      this.categoryService.updateCategory(this.editingId()!, {
        name: v.name!.trim(),
        slug: v.slug!.trim(),
        image: v.image!.trim(),
        status: v.status!,
        description: v.description!.trim(),
        metaRobots: v.metaRobots!,
        metaTitle: v.metaTitle!.trim() || v.name!.trim(),
        metaKeyword: v.metaKeyword?.trim() ?? '',
        metaDescription: v.metaDescription?.trim() ?? '',
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Category Updated',
        detail: 'Category has been updated successfully.',
      });
    } else {
      this.categoryService.addCategory({
        name: v.name!.trim(),
        slug: v.slug!.trim(),
        image: v.image!.trim(),
        status: 'Active',
        description: v.description!.trim(),
        metaRobots: v.metaRobots!,
        metaTitle: v.metaTitle!.trim() || v.name!.trim(),
        metaKeyword: v.metaKeyword?.trim() ?? '',
        metaDescription: v.metaDescription?.trim() ?? '',
      });
      this.messageService.add({
        severity: 'success',
        summary: 'Category Created',
        detail: 'New category has been added successfully.',
      });
    }

    this.modalVisible.set(false);
  }

  confirmDeleteSingle(category: BlogCategory): void {
    this.itemToDelete.set(category);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.categoryService.deleteCategory(single.id);
      this.selectedCategories.update(list => list.filter(c => c.id !== single.id));
      this.messageService.add({
        severity: 'success',
        summary: 'Category Deleted',
        detail: `Category "${single.name}" was deleted.`,
      });
    } else {
      const count = this.selectedCategories().length;
      const ids = this.selectedCategories().map(c => c.id);
      this.categoryService.deleteMultiple(ids);
      this.selectedCategories.set([]);
      this.messageService.add({
        severity: 'success',
        summary: 'Categories Deleted',
        detail: `${count} categories have been deleted.`,
      });
    }
    this.confirmDeleteVisible.set(false);
  }
}

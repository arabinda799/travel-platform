import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  ViewModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  BreadcrumbItem,
} from 'admin-core';
import { PageListService, PageItem } from './page-list.service';
import { exportToCsv } from '../../../shared/utils/export.util';

@Component({
  selector: 'app-page-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    ViewModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './page-list.html',
  styleUrl: './page-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageListComponent {
  private readonly pageService = inject(PageListService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Content', route: '/content/blogs' },
    { label: 'Pages' },
  ];

  readonly pages = this.pageService.pages;
  readonly searchQuery = signal('');
  readonly selectedPages = signal<PageItem[]>([]);
  readonly loading = signal(false);

  // Filter sidebar
  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedTemplateFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedTemplateFilter = signal<string | null>(null);

  // Add/Edit modal
  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);

  // View modal
  readonly viewModalVisible = signal(false);
  readonly activeItem = signal<PageItem | null>(null);

  // Delete dialog
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<PageItem | null>(null);

  readonly statusOptions = [
    { label: 'Published', value: 'Published' },
    { label: 'Draft', value: 'Draft' },
    { label: 'Archived', value: 'Archived' },
  ];

  readonly templateOptions = [
    { label: 'Home', value: 'Home' },
    { label: 'About', value: 'About' },
    { label: 'Contact', value: 'Contact' },
    { label: 'Blog', value: 'Blog' },
    { label: 'Generic', value: 'Generic' },
  ];

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required, Validators.maxLength(120)]),
    slug: new FormControl('', [Validators.required, Validators.maxLength(120)]),
    template: new FormControl('Generic', Validators.required),
    status: new FormControl<'Published' | 'Draft' | 'Archived'>('Draft', Validators.required),
    author: new FormControl('', Validators.required),
    content: new FormControl(''),
  });

  constructor() {
    this.form.controls.title.valueChanges.pipe(takeUntilDestroyed()).subscribe((title) => {
      if (!this.isEditing() && title) {
        this.form.controls.slug.setValue(this.generateSlug(title), { emitEvent: false });
      }
    });
  }

  // Templates
  readonly titleTpl = viewChild<TemplateRef<unknown>>('titleTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'title', header: 'Title / Slug', width: '22rem', sortable: true, bodyTemplate: this.titleTpl() },
    { field: 'template', header: 'Template', width: '10rem', sortable: true },
    { field: 'status', header: 'Status', width: '10rem', sortable: true, align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'author', header: 'Author', width: '14rem', sortable: true },
    { field: 'updatedAt', header: 'Updated At', width: '16rem', sortable: true },
    { field: 'actions', header: 'Action', width: '8rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedTemplateFilter()) count++;
    return count;
  });

  readonly filteredPages = computed(() => {
    let list = this.pages();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(p => p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(p => p.status === sf);
    const tf = this.appliedTemplateFilter();
    if (tf) list = list.filter(p => p.template === tf);
    return list;
  });

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedTemplateFilter.set(this.selectedTemplateFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedTemplateFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedTemplateFilter.set(null);
    this.filterVisible.set(false);
  }

  generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  }

  onTitleChange(): void {
    if (!this.isEditing()) {
      const title = this.form.controls.title.value ?? '';
      this.form.controls.slug.setValue(this.generateSlug(title));
    }
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ title: '', slug: '', template: 'Generic', status: 'Draft', author: '', content: '' });
    this.modalVisible.set(true);
  }

  openEditModal(item: PageItem): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({
      title: item.title,
      slug: item.slug,
      template: item.template,
      status: item.status,
      author: item.author,
      content: item.content ?? '',
    });
    this.modalVisible.set(true);
  }

  openViewModal(item: PageItem): void {
    this.activeItem.set(item);
    this.viewModalVisible.set(true);
  }

  onSavePage(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }
    const { title, slug, template, status, author, content } = this.form.getRawValue();
    const payload = {
      title: title!.trim(),
      slug: slug!.trim(),
      template: template!,
      status: status!,
      author: author!.trim(),
      content: content?.trim() || '',
    };
    if (this.isEditing() && this.editingId()) {
      this.pageService.updatePage(this.editingId()!, payload);
      this.messageService.add({ severity: 'success', summary: 'Page Updated', detail: 'Page details have been saved.' });
    } else {
      this.pageService.addPage(payload);
      this.messageService.add({ severity: 'success', summary: 'Page Created', detail: 'New page added successfully.' });
    }
    this.modalVisible.set(false);
  }

  confirmDeleteSingle(item: PageItem): void {
    this.itemToDelete.set(item);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedPages().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    if (single) {
      this.pageService.deletePage(single.id);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${single.title}" has been deleted.` });
    } else {
      const ids = this.selectedPages().map(p => p.id);
      this.pageService.bulkDelete(ids);
      this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${ids.length} pages deleted.` });
      this.selectedPages.set([]);
    }
    this.confirmDeleteVisible.set(false);
    this.itemToDelete.set(null);
  }

  exportData(selectedOnly = false): void {
    const rows = selectedOnly ? this.selectedPages() : this.filteredPages();
    if (rows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No pages to export.' });
      return;
    }
    exportToCsv('pages', rows, [
      { field: 'title', header: 'Title' },
      { field: 'slug', header: 'Slug' },
      { field: 'template', header: 'Template' },
      { field: 'status', header: 'Status' },
      { field: 'author', header: 'Author' },
      { field: 'updatedAt', header: 'Updated At' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Export Successful', detail: `${rows.length} records exported.` });
  }
}

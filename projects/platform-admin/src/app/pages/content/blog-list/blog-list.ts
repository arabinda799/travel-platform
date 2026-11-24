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
import { BlogPost, BlogService } from './blog.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    ReactiveFormsModule, PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent,
    ConfirmDialogComponent, StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './blog-list.html',
  styleUrl: './blog-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlogListComponent implements OnInit {
  readonly service = inject(BlogService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly searchQuery = signal('');
  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);
  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<BlogPost | null>(null);

  readonly form = new FormGroup({
    title: new FormControl('', Validators.required),
    slug: new FormControl('', Validators.required),
    categoryName: new FormControl(''),
    image: new FormControl(''),
    description: new FormControl(''),
    postedBy: new FormControl(''),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
  });

  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly filteredItems = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.service.posts();
    return this.service.posts().filter(p => p.title.toLowerCase().includes(q) || p.categoryName.toLowerCase().includes(q));
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'title', header: 'Title', width: '20rem', sortable: true },
    { field: 'categoryName', header: 'Category', width: '12rem' },
    { field: 'postedBy', header: 'Author', width: '12rem' },
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
    this.form.reset({ title: '', slug: '', categoryName: '', image: '', description: '', postedBy: '', status: 'Active' });
    this.modalVisible.set(true);
  }

  openEditModal(item: BlogPost): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({ title: item.title, slug: item.slug, categoryName: item.categoryName, image: item.image, description: item.description, postedBy: item.postedBy, status: item.status });
    this.modalVisible.set(true);
  }

  onTitleInput(): void {
    if (!this.isEditing()) {
      const title = this.form.controls.title.value ?? '';
      this.form.controls.slug.setValue(title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''));
    }
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const payload = {
      title: v.title!.trim(),
      slug: v.slug!.trim(),
      categoryName: v.categoryName?.trim() || '',
      image: v.image?.trim() || '',
      description: v.description?.trim() || '',
      postedBy: v.postedBy?.trim() || '',
      status: v.status!,
    };
    const obs = this.isEditing() && this.editingId()
      ? this.service.update(this.editingId()!, payload)
      : this.service.add(payload);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: this.isEditing() ? 'Updated' : 'Created', detail: `"${payload.title}" saved.` }); this.modalVisible.set(false); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to save.' }),
    });
  }

  confirmDelete(item: BlogPost): void { this.itemToDelete.set(item); this.confirmDeleteVisible.set(true); }

  executeDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.service.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => { this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `"${item.title}" deleted.` }); this.confirmDeleteVisible.set(false); },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
    });
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal, TemplateRef, viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  DatePickerFieldComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  BreadcrumbItem,
} from 'admin-core';
import { exportToCsv } from 'admin-core';
import { NewsletterSubscriber, NewsletterService } from './newsletter.service';

@Component({
  selector: 'app-newsletter',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    DatePickerFieldComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './newsletter.html',
  styleUrl: './newsletter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsletterComponent implements OnInit {
  private readonly newsletterService = inject(NewsletterService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Content', route: '/content/sliders' },
    { label: 'Newsletter' },
  ];

  readonly subscribers = this.newsletterService.subscribers;
  readonly loading = this.newsletterService.loading;
  readonly isSaving = signal<boolean>(false);
  readonly searchQuery = signal('');
  readonly selectedSubscribers = signal<NewsletterSubscriber[]>([]);

  readonly filterVisible = signal(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<[Date, Date] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<[Date, Date] | null>(null);

  readonly modalVisible = signal(false);
  readonly isEditing = signal(false);
  readonly editingId = signal<string | null>(null);

  readonly confirmDeleteVisible = signal(false);
  readonly itemToDelete = signal<NewsletterSubscriber | null>(null);

  readonly subscriptionStatusOptions = [
    { label: 'Subscribed', value: 'Subscribed' },
    { label: 'Unsubscribed', value: 'Unsubscribed' },
  ];

  readonly form = new FormGroup({
    name: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    status: new FormControl<'Subscribed' | 'Unsubscribed'>('Subscribed', Validators.required),
  });

  readonly nameTpl = viewChild<TemplateRef<unknown>>('nameTpl');
  readonly emailTpl = viewChild<TemplateRef<unknown>>('emailTpl');
  readonly statusTpl = viewChild<TemplateRef<unknown>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<unknown>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'name', header: 'Name', width: '18rem', sortable: true, bodyTemplate: this.nameTpl() },
    { field: 'email', header: 'Email ID', width: '24rem', sortable: true, bodyTemplate: this.emailTpl() },
    { field: 'status', header: 'Status', width: '10rem', sortable: true, align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Subscribed On', width: '18rem', sortable: true },
    { field: 'actions', header: 'Action', width: '7rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedDateRangeFilter()?.[0]) count++;
    return count;
  });

  readonly filteredSubscribers = computed(() => {
    let list = this.subscribers();
    const q = this.searchQuery().toLowerCase().trim();
    if (q) list = list.filter(item => item.email.toLowerCase().includes(q) || item.name.toLowerCase().includes(q));

    const sf = this.appliedStatusFilter();
    if (sf) list = list.filter(item => item.status === sf);

    const dateRange = this.appliedDateRangeFilter();
    if (dateRange?.[0]) {
      const start = new Date(dateRange[0]).setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]).setHours(23, 59, 59, 999) : new Date(dateRange[0]).setHours(23, 59, 59, 999);
      list = list.filter(item => {
        const dateStr = item.createdDate.split('/')[0].trim();
        const t = new Date(dateStr).getTime();
        return isNaN(t) || (t >= start && t <= end);
      });
    }

    return list;
  });

  ngOnInit(): void {
    this.newsletterService.load();
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

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

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ name: '', email: '', status: 'Subscribed' });
    this.modalVisible.set(true);
  }

  openEditModal(subscriber: NewsletterSubscriber): void {
    this.isEditing.set(true);
    this.editingId.set(subscriber.id);
    this.form.patchValue({ name: subscriber.name, email: subscriber.email, status: subscriber.status });
    this.modalVisible.set(true);
  }

  onSaveSubscriber(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please provide a valid email address.' });
      return;
    }
    const { name, email, status } = this.form.getRawValue();
    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id
      ? this.newsletterService.updateSubscriber(id, { name: (name ?? '').trim(), email: (email ?? '').trim().toLowerCase(), status: status ?? 'Subscribed' })
      : this.newsletterService.addSubscriber({ name: (name ?? '').trim(), email: (email ?? '').trim().toLowerCase(), status: status ?? 'Subscribed' });

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: id ? 'Subscriber Updated' : 'Subscriber Added', detail: id ? 'Newsletter subscriber record updated.' : 'New email subscriber registered successfully.' });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: (err: { error?: { message?: string } }) => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err?.error?.message || 'Could not save subscriber.' });
        this.isSaving.set(false);
      },
    });
  }

  confirmDeleteSingle(subscriber: NewsletterSubscriber): void {
    this.itemToDelete.set(subscriber);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedSubscribers().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.newsletterService.deleteSubscriber(single.id)
      : this.newsletterService.bulkDelete(this.selectedSubscribers().map(s => s.id));

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${single.email} removed from newsletter.` });
        } else {
          const count = this.selectedSubscribers().length;
          this.selectedSubscribers.set([]);
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${count} subscribers removed.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not delete subscriber(s).' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }

  exportData(selectedOnly = false): void {
    const rows = selectedOnly ? this.selectedSubscribers() : this.filteredSubscribers();
    if (rows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'No subscriber records to export.' });
      return;
    }
    exportToCsv('newsletter_subscribers', rows, [
      { field: 'name', header: 'Name' },
      { field: 'email', header: 'Email ID' },
      { field: 'status', header: 'Status' },
      { field: 'createdDate', header: 'Subscribed On' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Export Successful', detail: `${rows.length} records exported.` });
  }
}

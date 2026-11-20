import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
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
  StatusModalComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  SelectOption,
} from 'admin-core';
import { Customer, CustomerService, CustomerStatus } from './customer.service';

const CUSTOMER_STATUS_OPTIONS: SelectOption<CustomerStatus>[] = [
  { label: 'Active', value: 'Active', description: 'Customer can log in and book' },
  { label: 'Inactive', value: 'Inactive', description: 'Account disabled temporarily' },
  { label: 'Blocked', value: 'Blocked', description: 'Account permanently blocked' },
];

const COUNTRY_OPTIONS: SelectOption<string>[] = [
  { label: 'India', value: 'India' },
  { label: 'UAE', value: 'UAE' },
  { label: 'Saudi Arabia', value: 'Saudi Arabia' },
  { label: 'Bahrain', value: 'Bahrain' },
  { label: 'Kuwait', value: 'Kuwait' },
  { label: 'Qatar', value: 'Qatar' },
  { label: 'Oman', value: 'Oman' },
  { label: 'Singapore', value: 'Singapore' },
  { label: 'Malaysia', value: 'Malaysia' },
  { label: 'USA', value: 'USA' },
  { label: 'UK', value: 'UK' },
  { label: 'Australia', value: 'Australia' },
  { label: 'Canada', value: 'Canada' },
  { label: 'Germany', value: 'Germany' },
  { label: 'France', value: 'France' },
  { label: 'Other', value: 'Other' },
];

@Component({
  selector: 'app-customer-list',
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
    StatusModalComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './customer-list.html',
  styleUrl: './customer-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerListComponent {
  private readonly customerService = inject(CustomerService);
  private readonly messageService = inject(MessageService);

  readonly customers = this.customerService.customers;
  readonly searchQuery = signal<string>('');
  readonly loading = signal<boolean>(false);
  readonly selectedCustomers = signal<Customer[]>([]);

  // Filter state
  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly selectedCountryFilter = signal<string | null>(null);
  readonly selectedDateRangeFilter = signal<Date[] | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);
  readonly appliedCountryFilter = signal<string | null>(null);
  readonly appliedDateRangeFilter = signal<Date[] | null>(null);

  // Modal state
  readonly statusModalVisible = signal<boolean>(false);
  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  // Confirm delete state
  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<Customer | null>(null);

  readonly form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    country: new FormControl('', Validators.required),
    status: new FormControl<CustomerStatus>('Active', Validators.required),
  });

  // Template refs
  readonly nameTpl = viewChild<TemplateRef<any>>('nameTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = CUSTOMER_STATUS_OPTIONS;
  readonly countryOptions = COUNTRY_OPTIONS;

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedStatusFilter()) count++;
    if (this.appliedCountryFilter()) count++;
    const range = this.appliedDateRangeFilter();
    if (range && range.length > 0 && range[0]) count++;
    return count;
  });

  readonly filteredCustomers = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const statusFilter = this.appliedStatusFilter();
    const countryFilter = this.appliedCountryFilter();
    const dateRange = this.appliedDateRangeFilter();

    let list = this.customers();

    if (statusFilter) list = list.filter(c => c.status === statusFilter);
    if (countryFilter) list = list.filter(c => c.country === countryFilter);

    if (dateRange && dateRange.length > 0 && dateRange[0]) {
      const start = new Date(dateRange[0]);
      start.setHours(0, 0, 0, 0);
      const end = dateRange[1] ? new Date(dateRange[1]) : new Date(start);
      end.setHours(23, 59, 59, 999);
      list = list.filter(c => {
        const datePart = c.registeredAt.split(' / ')[0];
        const d = new Date(datePart);
        if (isNaN(d.getTime())) return true;
        return d >= start && d <= end;
      });
    }

    if (!query) return list;

    return list.filter(
      c =>
        c.firstName.toLowerCase().includes(query) ||
        c.lastName.toLowerCase().includes(query) ||
        c.email.toLowerCase().includes(query) ||
        c.phone.includes(query) ||
        c.country.toLowerCase().includes(query),
    );
  });

  readonly columns = computed<TableColumn[]>(() => [
    {
      field: 'name',
      header: 'Customer',
      width: '18rem',
      sortable: true,
      bodyTemplate: this.nameTpl(),
    },
    {
      field: 'phone',
      header: 'Phone',
      width: '13rem',
    },
    {
      field: 'country',
      header: 'Country',
      width: '11rem',
      sortable: true,
    },
    {
      field: 'status',
      header: 'Status',
      width: '8.5rem',
      align: 'center',
      sortable: true,
      bodyTemplate: this.statusTpl(),
    },
    {
      field: 'registeredAt',
      header: 'Registered',
      width: '13rem',
      sortable: true,
    },
    {
      field: 'lastLogin',
      header: 'Last Login',
      width: '13rem',
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

  applyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.appliedCountryFilter.set(this.selectedCountryFilter());
    this.appliedDateRangeFilter.set(this.selectedDateRangeFilter());
    this.filterVisible.set(false);
  }

  resetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.selectedCountryFilter.set(null);
    this.selectedDateRangeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.appliedCountryFilter.set(null);
    this.appliedDateRangeFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ firstName: '', lastName: '', email: '', phone: '', country: '', status: 'Active' });
    this.modalVisible.set(true);
  }

  openEditModal(item: Customer): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({
      firstName: item.firstName,
      lastName: item.lastName,
      email: item.email,
      phone: item.phone,
      country: item.country,
      status: item.status,
    });
    this.modalVisible.set(true);
  }

  saveCustomer(): void {
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
    const payload = {
      firstName: (v.firstName || '').trim(),
      lastName: (v.lastName || '').trim(),
      email: (v.email || '').trim().toLowerCase(),
      phone: (v.phone || '').trim(),
      country: v.country || '',
      status: (v.status || 'Active') as CustomerStatus,
    };

    const fullName = `${payload.firstName} ${payload.lastName}`;

    if (this.isEditing() && this.editingId()) {
      this.customerService.update(this.editingId()!, payload);
      this.messageService.add({ severity: 'success', summary: 'Updated', detail: `${fullName} has been updated.` });
    } else {
      this.customerService.add(payload);
      this.messageService.add({ severity: 'success', summary: 'Created', detail: `${fullName} has been added.` });
    }

    this.modalVisible.set(false);
  }

  openBulkStatusModal(): void {
    if (this.selectedCustomers().length === 0) return;
    this.statusModalVisible.set(true);
  }

  onBulkStatusConfirm(newStatus: string): void {
    const selected = this.selectedCustomers();
    const status = newStatus as CustomerStatus;
    selected.forEach(c => this.customerService.updateStatus(c.id, status));
    this.selectedCustomers.set([]);
    this.statusModalVisible.set(false);
    this.messageService.add({
      severity: 'info',
      summary: 'Status Updated',
      detail: `Updated status to ${status} for ${selected.length} customer(s).`,
    });
  }

  confirmDelete(item: Customer): void {
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
      this.customerService.delete(single.id);
      this.messageService.add({
        severity: 'success',
        summary: 'Deleted',
        detail: `${single.firstName} ${single.lastName} was deleted.`,
      });
    } else {
      const ids = this.selectedCustomers().map(c => c.id);
      this.customerService.deleteMultiple(ids);
      this.selectedCustomers.set([]);
      this.messageService.add({
        severity: 'success',
        summary: 'Bulk Deleted',
        detail: `${ids.length} customer(s) were deleted.`,
      });
    }
    this.confirmDeleteVisible.set(false);
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef,
  computed, inject, signal, TemplateRef, viewChild, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ReactiveFormsModule, FormGroup, FormControl, Validators,
  AbstractControl, ValidationErrors,
} from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, TextareaFieldComponent,
  SelectFieldComponent, FilterSidebarComponent, ConfirmDialogComponent,
  StatusBadgeComponent, TableActionComponent, TableColumn, STATUS_OPTIONS,
} from 'admin-core';
import {
  Vendor, VendorAuthType, VendorMode, VendorServiceType, VendorListService,
} from './vendor-list.service';
import { exportToCsv } from 'admin-core';

function jsonValidator(control: AbstractControl): ValidationErrors | null {
  if (!control.value) return null;
  try {
    const parsed = JSON.parse(control.value);
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { invalidJson: 'Must be a valid JSON object' };
    }
    return null;
  } catch {
    return { invalidJson: 'Invalid JSON syntax' };
  }
}

@Component({
  selector: 'app-vendor-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, TextareaFieldComponent,
    SelectFieldComponent, FilterSidebarComponent, ConfirmDialogComponent,
    StatusBadgeComponent, TableActionComponent,
  ],
  templateUrl: './vendor-list.html',
  styleUrl: './vendor-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VendorListComponent implements OnInit {
  private readonly vendorService = inject(VendorListService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly vendors = this.vendorService.vendors;
  readonly loading = this.vendorService.loading;
  readonly searchQuery = signal<string>('');
  readonly selectedVendors = signal<Vendor[]>([]);

  readonly filterVisible = signal<boolean>(false);
  readonly selectedServiceFilter = signal<string | null>(null);
  readonly appliedServiceFilter = signal<string | null>(null);
  readonly selectedModeFilter = signal<string | null>(null);
  readonly appliedModeFilter = signal<string | null>(null);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);
  readonly isSaving = signal<boolean>(false);

  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<Vendor | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', Validators.required),
    code: new FormControl('', Validators.required),
    serviceType: new FormControl<VendorServiceType>('HOTEL', Validators.required),
    mode: new FormControl<VendorMode>('LIVE', Validators.required),
    apiUrl: new FormControl('', Validators.required),
    authType: new FormControl<VendorAuthType>('BASIC_AUTH', Validators.required),
    credentialsJson: new FormControl('{\n  "keyId": "",\n  "apiKey": ""\n}', [
      Validators.required, jsonValidator,
    ]),
    status: new FormControl<'Active' | 'Inactive'>('Active', Validators.required),
  });

  readonly vendorTpl = viewChild<TemplateRef<any>>('vendorTpl');
  readonly servicesTpl = viewChild<TemplateRef<any>>('servicesTpl');
  readonly modeTpl = viewChild<TemplateRef<any>>('modeTpl');
  readonly endpointTpl = viewChild<TemplateRef<any>>('endpointTpl');
  readonly credentialsTpl = viewChild<TemplateRef<any>>('credentialsTpl');
  readonly healthTpl = viewChild<TemplateRef<any>>('healthTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly serviceOptions = [
    { label: 'Hotel Inventory', value: 'HOTEL' },
    { label: 'Flight GDS & LCC', value: 'FLIGHT' },
    { label: 'Holiday Packages', value: 'HOLIDAY' },
    { label: 'Bus Inventory', value: 'BUS' },
  ];

  readonly modeOptions = [
    { label: 'Live (Production)', value: 'LIVE' },
    { label: 'Test (Sandbox)', value: 'TEST' },
  ];

  readonly authTypeOptions = [
    { label: 'Basic Auth (Username / Password)', value: 'BASIC_AUTH' },
    { label: 'API Key (Header / Query)', value: 'API_KEY' },
    { label: 'Bearer Token (OAuth 2.0)', value: 'BEARER_TOKEN' },
  ];

  readonly statusOptions = STATUS_OPTIONS;

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'name', header: 'Vendor / Supplier', width: '16rem', sortable: true, bodyTemplate: this.vendorTpl() },
    { field: 'services', header: 'Services', width: '13rem', bodyTemplate: this.servicesTpl() },
    { field: 'mode', header: 'Environment', width: '9.5rem', align: 'center', sortable: true, bodyTemplate: this.modeTpl() },
    { field: 'apiUrl', header: 'API Endpoint', width: '20rem', bodyTemplate: this.endpointTpl() },
    { field: 'credentials', header: 'Credentials (JSON)', width: '18rem', bodyTemplate: this.credentialsTpl() },
    { field: 'healthStatus', header: 'Health & Latency', width: '11.5rem', align: 'center', sortable: true, bodyTemplate: this.healthTpl() },
    { field: 'isActive', header: 'Status', width: '8.5rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '8rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  readonly activeFilterCount = computed(() => {
    let count = 0;
    if (this.appliedServiceFilter()) count++;
    if (this.appliedModeFilter()) count++;
    if (this.appliedStatusFilter()) count++;
    return count;
  });

  readonly filteredVendors = computed(() => {
    let list = this.vendors();
    const query = this.searchQuery().toLowerCase().trim();
    if (query) {
      list = list.filter(v =>
        v.name.toLowerCase().includes(query) ||
        v.code.toLowerCase().includes(query) ||
        v.apiUrl.toLowerCase().includes(query) ||
        v.services.some(s => s.toLowerCase().includes(query)) ||
        JSON.stringify(v.credentials).toLowerCase().includes(query)
      );
    }
    const serviceFilter = this.appliedServiceFilter();
    if (serviceFilter) list = list.filter(v => v.services.includes(serviceFilter as VendorServiceType));
    const modeFilter = this.appliedModeFilter();
    if (modeFilter) list = list.filter(v => v.mode === modeFilter);
    const statusFilter = this.appliedStatusFilter();
    if (statusFilter) list = list.filter(v => v.isActive === (statusFilter === 'Active'));
    return list;
  });

  ngOnInit(): void {
    this.vendorService.load();
  }

  getCredentialKeys(creds: Record<string, any> | undefined): string[] {
    return creds ? Object.keys(creds) : [];
  }

  getMaskedValue(val: any): string {
    const str = String(val ?? '');
    if (str.length <= 4) return '••••';
    return `${str.slice(0, 3)}••••${str.slice(-3)}`;
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  onApplyFilters(): void {
    this.appliedServiceFilter.set(this.selectedServiceFilter());
    this.appliedModeFilter.set(this.selectedModeFilter());
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.filterVisible.set(false);
  }

  onResetFilters(): void {
    this.selectedServiceFilter.set(null);
    this.selectedModeFilter.set(null);
    this.selectedStatusFilter.set(null);
    this.appliedServiceFilter.set(null);
    this.appliedModeFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({
      name: '', code: '', serviceType: 'HOTEL', mode: 'LIVE', apiUrl: '',
      authType: 'BASIC_AUTH', credentialsJson: '{\n  "keyId": "",\n  "apiKey": ""\n}', status: 'Active',
    });
    this.modalVisible.set(true);
  }

  openEditModal(vendor: Vendor): void {
    this.isEditing.set(true);
    this.editingId.set(vendor.id);
    this.form.patchValue({
      name: vendor.name, code: vendor.code,
      serviceType: vendor.services[0] || 'HOTEL', mode: vendor.mode,
      apiUrl: vendor.apiUrl, authType: vendor.authType,
      credentialsJson: JSON.stringify(vendor.credentials || {}, null, 2),
      status: vendor.isActive ? 'Active' : 'Inactive',
    });
    this.modalVisible.set(true);
  }

  onSaveVendor(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please verify all required fields and ensure Credentials is valid JSON.' });
      return;
    }

    const v = this.form.getRawValue();
    const services: VendorServiceType[] = [v.serviceType || 'HOTEL'];
    let credentials: Record<string, any> = {};
    try {
      credentials = JSON.parse(v.credentialsJson || '{}');
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Invalid JSON', detail: 'The Credentials JSON is invalid.' });
      return;
    }

    const payload = {
      name: (v.name || '').trim(), code: (v.code || '').trim().toUpperCase(),
      services, mode: v.mode || 'LIVE', apiUrl: (v.apiUrl || '').trim(),
      authType: v.authType || 'BASIC_AUTH', credentials, isActive: v.status === 'Active',
    };

    this.isSaving.set(true);
    const id = this.editingId();
    const obs$ = id ? this.vendorService.updateVendor(id, payload) : this.vendorService.addVendor(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Vendor Updated' : 'Vendor Registered',
          detail: id ? `Integration settings for ${result.name} updated successfully.` : `New vendor ${result.name} added to integration pipeline.`,
        });
        this.isSaving.set(false);
        this.modalVisible.set(false);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save vendor. Please try again.' });
        this.isSaving.set(false);
      },
    });
  }

  pingVendor(vendor: Vendor): void {
    this.vendorService.pingVendor(vendor.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        const latencyMs = updated.latencyMs;
        const success = updated.isActive;
        this.messageService.add({
          severity: success ? 'success' : 'warn',
          summary: success ? 'Ping Successful' : 'Connection Inactive',
          detail: success
            ? `Connection to ${vendor.name} (${vendor.mode}) verified successfully in ${latencyMs}ms.`
            : `${vendor.name} is currently inactive. Please enable it before running live inventory calls.`,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Ping Failed', detail: `Could not reach ${vendor.name}.` });
      },
    });
  }

  toggleVendorStatus(vendor: Vendor): void {
    const newStatus = !vendor.isActive;
    this.vendorService.toggleStatus(vendor.id, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({
          severity: newStatus ? 'success' : 'info',
          summary: 'Status Changed',
          detail: `${vendor.name} is now ${newStatus ? 'Active' : 'Inactive'}.`,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not change vendor status.' });
      },
    });
  }

  confirmDeleteSingle(vendor: Vendor): void {
    this.itemToDelete.set(vendor);
    this.confirmDeleteVisible.set(true);
  }

  confirmBulkDelete(): void {
    if (this.selectedVendors().length === 0) return;
    this.itemToDelete.set(null);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const single = this.itemToDelete();
    const obs$ = single
      ? this.vendorService.deleteVendor(single.id)
      : this.vendorService.bulkDelete(this.selectedVendors().map(v => v.id));

    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        if (single) {
          this.messageService.add({ severity: 'success', summary: 'Vendor Removed', detail: `Vendor "${single.name}" has been removed.` });
        } else {
          const count = this.selectedVendors().length;
          this.selectedVendors.set([]);
          this.messageService.add({ severity: 'success', summary: 'Vendors Removed', detail: `${count} vendors removed successfully.` });
        }
        this.confirmDeleteVisible.set(false);
        this.itemToDelete.set(null);
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not remove vendor(s).' });
        this.confirmDeleteVisible.set(false);
      },
    });
  }

  exportData(selectedOnly = false): void {
    const rows = selectedOnly ? this.selectedVendors() : this.filteredVendors();
    if (rows.length === 0) {
      this.messageService.add({ severity: 'warn', summary: 'No Data', detail: 'There are no vendor records to export.' });
      return;
    }
    exportToCsv('vendor_suppliers_list', rows.map(r => ({
      ...r, services: r.services.join(', '),
      credentials: JSON.stringify(r.credentials), status: r.isActive ? 'Active' : 'Inactive',
    })), [
      { field: 'name', header: 'Vendor Name' },
      { field: 'code', header: 'Vendor Code' },
      { field: 'services', header: 'Services' },
      { field: 'mode', header: 'Environment Mode' },
      { field: 'apiUrl', header: 'API Endpoint' },
      { field: 'authType', header: 'Auth Type' },
      { field: 'credentials', header: 'Credentials (JSON)' },
      { field: 'latencyMs', header: 'Latency (ms)' },
      { field: 'healthStatus', header: 'Health Status' },
      { field: 'status', header: 'Status' },
      { field: 'lastSync', header: 'Last Synced' },
    ]);
    this.messageService.add({ severity: 'success', summary: 'Export Successful', detail: `${rows.length} vendor integration records exported.` });
  }
}

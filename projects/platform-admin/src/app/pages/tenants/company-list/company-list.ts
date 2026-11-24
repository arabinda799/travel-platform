import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  DataTableComponent,
  ButtonComponent,
  FormModalComponent,
  TextFieldComponent,
  SelectFieldComponent,
  FilterSidebarComponent,
  ConfirmDialogComponent,
  StatusBadgeComponent,
  TableActionComponent,
  TableColumn,
  TableLazyEvent,
  SelectOption,
} from 'admin-core';
import { TenantCompany, TenantStatus, FirmType, PgOwner, CompanyService, DEFAULT_BRANDING, DEFAULT_SMTP } from './company.service';

const STATUS_OPTIONS: SelectOption<TenantStatus>[] = [
  { label: 'Active', value: 'ACTIVE', description: 'Tenant is live and operational' },
  { label: 'Trial', value: 'TRIAL', description: 'On free trial period' },
  { label: 'Inactive', value: 'INACTIVE', description: 'Temporarily disabled' },
  { label: 'Suspended', value: 'SUSPENDED', description: 'Suspended due to policy violation' },
  { label: 'Expired', value: 'EXPIRED', description: 'Trial or subscription expired' },
];

const FIRM_TYPE_OPTIONS: SelectOption<FirmType>[] = [
  { label: 'Proprietorship', value: 'PROPRIETORSHIP' },
  { label: 'Partnership', value: 'PARTNERSHIP' },
  { label: 'Private Limited', value: 'PVT_LTD' },
  { label: 'LLP', value: 'LLP' },
];

const PG_OWNER_OPTIONS: SelectOption<PgOwner>[] = [
  { label: 'Platform (Our PG)', value: 'PLATFORM', description: 'Platform handles payment gateway' },
  { label: 'Tenant (Own PG)', value: 'TENANT', description: 'Tenant uses their own payment gateway' },
];

@Component({
  selector: 'app-company-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent,
    DataTableComponent,
    ButtonComponent,
    FormModalComponent,
    TextFieldComponent,
    SelectFieldComponent,
    FilterSidebarComponent,
    ConfirmDialogComponent,
    StatusBadgeComponent,
    TableActionComponent,
  ],
  templateUrl: './company-list.html',
  styleUrl: './company-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyListComponent implements OnInit {
  readonly companyService = inject(CompanyService);
  private readonly messageService = inject(MessageService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly companies = this.companyService.companies;
  readonly searchQuery = signal<string>('');
  readonly loading = this.companyService.loading;

  readonly filterVisible = signal<boolean>(false);
  readonly selectedStatusFilter = signal<string | null>(null);
  readonly appliedStatusFilter = signal<string | null>(null);

  readonly modalVisible = signal<boolean>(false);
  readonly isEditing = signal<boolean>(false);
  readonly editingId = signal<string | null>(null);

  readonly confirmDeleteVisible = signal<boolean>(false);
  readonly itemToDelete = signal<TenantCompany | null>(null);

  readonly nameTpl = viewChild<TemplateRef<any>>('nameTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly firmTypeTpl = viewChild<TemplateRef<any>>('firmTypeTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly statusOptions = STATUS_OPTIONS;
  readonly firmTypeOptions = FIRM_TYPE_OPTIONS;
  readonly pgOwnerOptions = PG_OWNER_OPTIONS;

  readonly form = new FormGroup({
    companyName: new FormControl('', Validators.required),
    companyCode: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    domain: new FormControl('', Validators.required),
    firmType: new FormControl<FirmType>('PVT_LTD', Validators.required),
    pgOwner: new FormControl<PgOwner>('PLATFORM', Validators.required),
    status: new FormControl<TenantStatus>('ACTIVE', Validators.required),
    legalName: new FormControl(''),
    gstNumber: new FormControl(''),
    trialEndsAt: new FormControl<string | null>(null),
  });

  readonly filteredCompanies = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const statusFilter = this.appliedStatusFilter();
    let list = this.companies();
    if (statusFilter) list = list.filter(c => c.status === statusFilter);
    if (!query) return list;
    return list.filter(
      c =>
        c.companyName.toLowerCase().includes(query) ||
        c.companyCode.toLowerCase().includes(query) ||
        c.domain.toLowerCase().includes(query),
    );
  });

  readonly activeFilterCount = computed(() => (this.appliedStatusFilter() ? 1 : 0));

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'companyName', header: 'Company', width: '20rem', sortable: true, bodyTemplate: this.nameTpl() },
    { field: 'domain', header: 'Domain', width: '16rem' },
    { field: 'firmType', header: 'Firm Type', width: '12rem', bodyTemplate: this.firmTypeTpl() },
    { field: 'pgOwner', header: 'PG Owner', width: '10rem' },
    { field: 'status', header: 'Status', width: '8rem', align: 'center', sortable: true, bodyTemplate: this.statusTpl() },
    { field: 'actions', header: 'Action', width: '10rem', align: 'center', frozen: true, frozenAlign: 'right', bodyTemplate: this.actionsTpl() },
  ]);

  getFirmTypeLabel(firmType: FirmType): string {
    return FIRM_TYPE_OPTIONS.find(o => o.value === firmType)?.label ?? firmType;
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  applyFilters(): void {
    this.appliedStatusFilter.set(this.selectedStatusFilter());
    this.filterVisible.set(false);
  }

  ngOnInit(): void { this.companyService.load(); }

  onLazyLoad(e: TableLazyEvent): void {
    const page = Math.floor((e.first ?? 0) / (e.rows ?? 50)) + 1;
    if (page !== this.companyService.page()) this.companyService.goToPage(page);
  }

  resetFilters(): void {
    this.selectedStatusFilter.set(null);
    this.appliedStatusFilter.set(null);
    this.filterVisible.set(false);
  }

  openAddModal(): void {
    this.isEditing.set(false);
    this.editingId.set(null);
    this.form.reset({ companyName: '', companyCode: '', domain: '', firmType: 'PVT_LTD', pgOwner: 'PLATFORM', status: 'ACTIVE', legalName: '', gstNumber: '', trialEndsAt: null });
    this.modalVisible.set(true);
  }

  openEditModal(item: TenantCompany): void {
    this.isEditing.set(true);
    this.editingId.set(item.id);
    this.form.patchValue({
      companyName: item.companyName, companyCode: item.companyCode, domain: item.domain,
      firmType: item.firmType, pgOwner: item.pgOwner, status: item.status,
      legalName: item.legalName ?? '', gstNumber: item.gstNumber, trialEndsAt: item.trialEndsAt,
    });
    this.modalVisible.set(true);
  }

  saveCompany(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.' });
      return;
    }
    const v = this.form.getRawValue();
    const payload = {
      companyName: (v.companyName ?? '').trim(),
      companyCode: (v.companyCode ?? '').trim().toUpperCase(),
      domain: (v.domain ?? '').trim().toLowerCase(),
      firmType: v.firmType as FirmType,
      pgOwner: v.pgOwner as PgOwner,
      status: v.status as TenantStatus,
      legalName: (v.legalName ?? '').trim() || null,
      gstNumber: (v.gstNumber ?? '').trim(),
      trialEndsAt: v.trialEndsAt ?? null,
      branding: { ...DEFAULT_BRANDING },
      smtp: { ...DEFAULT_SMTP },
    };

    if (this.isEditing() && this.editingId()) {
      const existing = this.companyService.companies().find(c => c.id === this.editingId());
      const editPayload = { ...payload, branding: existing?.branding ?? payload.branding, smtp: existing?.smtp ?? payload.smtp };
      this.companyService.update(this.editingId()!, editPayload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Updated', detail: `${payload.companyName} updated.` });
            this.modalVisible.set(false);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to update company.' }),
        });
    } else {
      this.companyService.add(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: created => {
            this.messageService.add({ severity: 'success', summary: 'Created', detail: `${payload.companyName} created. Configure whitelabel settings now.` });
            this.modalVisible.set(false);
            this.router.navigate(['/tenants/companies', created.id, 'settings']);
          },
          error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to create company.' }),
        });
    }
  }

  openSettings(item: TenantCompany): void {
    this.router.navigate(['/tenants/companies', item.id, 'settings']);
  }

  confirmDelete(item: TenantCompany): void {
    this.itemToDelete.set(item);
    this.confirmDeleteVisible.set(true);
  }

  executeDelete(): void {
    const item = this.itemToDelete();
    if (!item) return;
    this.companyService.delete(item.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Deleted', detail: `${item.companyName} deleted.` });
          this.confirmDeleteVisible.set(false);
        },
        error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed.' }),
      });
  }
}

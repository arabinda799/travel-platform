import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
  TemplateRef, viewChild, OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  StatusBadgeComponent, StatusModalComponent, FormModalComponent,
  TextFieldComponent, TextareaFieldComponent, SelectFieldComponent, FileUploadFieldComponent,
  TableActionComponent, ThumbImageComponent, TableColumn, TableLazyEvent, BreadcrumbItem,
} from 'admin-core';
import {
  PaymentGatewaysService, PaymentGateway, PaymentMode, ALL_PAYMENT_MODES,
} from './payment-gateways.service';

@Component({
  selector: 'app-payment-gateways',
  standalone: true,
  imports: [
    DatePipe, ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    StatusBadgeComponent, StatusModalComponent, FormModalComponent,
    TextFieldComponent, TextareaFieldComponent, SelectFieldComponent, FileUploadFieldComponent,
    TableActionComponent, ThumbImageComponent,
  ],
  templateUrl: './payment-gateways.html',
  styleUrl: './payment-gateways.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaymentGatewaysComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PaymentGatewaysService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly allPaymentModes = ALL_PAYMENT_MODES;

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'System' },
    { label: 'Settings', route: '/system/settings/company' },
    { label: 'Payment Gateway List' },
  ];

  readonly gateways = this.service.gateways;
  readonly isLoading = this.service.loading;
  readonly searchQuery = signal<string>('');
  selectedGateways: PaymentGateway[] = [];

  readonly filteredGateways = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const list = this.gateways();
    if (!q) return list;
    return list.filter(g =>
      g.name.toLowerCase().includes(q) ||
      g.remark.toLowerCase().includes(q) ||
      g.paymentModes.some(m => m.toLowerCase().includes(q))
    );
  });

  readonly imageTpl = viewChild<TemplateRef<any>>('imageTpl');
  readonly modeTpl = viewChild<TemplateRef<any>>('modeTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');
  readonly dateTpl = viewChild<TemplateRef<any>>('dateTpl');
  readonly actionsTpl = viewChild<TemplateRef<any>>('actionsTpl');

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'image', header: 'Logo', width: '5.5rem', align: 'center', bodyTemplate: this.imageTpl() },
    { field: 'name', header: 'Gateway Name', sortable: true, width: '11rem' },
    { field: 'paymentModes', header: 'Payment Mode', sortable: false, width: '18rem', bodyTemplate: this.modeTpl() },
    { field: 'status', header: 'Status', sortable: true, width: '8.5rem', align: 'center', bodyTemplate: this.statusTpl() },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '13rem', bodyTemplate: this.dateTpl() },
    { field: 'actions', header: 'Action', width: '5.5rem', align: 'center', bodyTemplate: this.actionsTpl(), frozen: true, frozenAlign: 'right' },
  ]);

  readonly statusModalVisible = signal<boolean>(false);
  readonly statusModalOptions = [
    { label: 'Active', value: 'Active', description: 'Enable gateway for customer checkout' },
    { label: 'Inactive', value: 'Inactive', description: 'Temporarily disable gateway' },
  ];

  readonly isModalVisible = signal<boolean>(false);
  readonly isSaving = signal<boolean>(false);
  readonly editingGatewayId = signal<string | null>(null);
  readonly isModeDropdownOpen = signal<boolean>(false);
  readonly gatewayImageFileName = signal<string>('');

  gatewayForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    image: [''],
    paymentModes: [[] as PaymentMode[], [Validators.required]],
    remark: [''],
    credentialsJson: ['{\n  "key": "",\n  "salt": "",\n  "merchantId": "",\n  "environment": "production"\n}', [Validators.required]],
    status: ['Active', [Validators.required]],
  });

  get modalTitle(): string {
    return this.editingGatewayId() ? 'Update Payment Gateway' : 'Add Payment Gateway';
  }

  get modalSubtitle(): string {
    return this.editingGatewayId()
      ? 'Modify gateway settings, supported modes, and credentials'
      : 'Configure a new payment gateway provider and its API credentials';
  }

  ngOnInit(): void {
    this.service.loadGateways();
  }

  goToConvenienceFees(): void {
    this.router.navigate(['/system/settings/convenience-fee']);
  }

  onSearch(query: string): void { this.searchQuery.set(query); }

  onLazyLoad(_event: TableLazyEvent): void {}

  openAddModal(): void {
    this.editingGatewayId.set(null);
    this.gatewayImageFileName.set('');
    this.gatewayForm.reset({
      name: '', image: '', paymentModes: [...ALL_PAYMENT_MODES], remark: '',
      credentialsJson: JSON.stringify({ key: '', salt: '', merchantId: '', environment: 'production' }, null, 2),
      status: 'Active',
    });
    this.isModeDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  openEditModal(gateway: PaymentGateway): void {
    this.editingGatewayId.set(gateway.id);
    this.gatewayImageFileName.set(gateway.image ? gateway.image.split('/').pop() || 'logo' : '');
    this.gatewayForm.patchValue({
      name: gateway.name, image: gateway.image, paymentModes: [...gateway.paymentModes],
      remark: gateway.remark, credentialsJson: JSON.stringify(gateway.credentials || {}, null, 2),
      status: gateway.status,
    });
    this.isModeDropdownOpen.set(false);
    this.isModalVisible.set(true);
  }

  closeModal(): void {
    this.isModalVisible.set(false);
    this.editingGatewayId.set(null);
  }

  toggleModeDropdown(): void { this.isModeDropdownOpen.update(open => !open); }

  isModeSelected(mode: PaymentMode): boolean {
    const selected = (this.gatewayForm.get('paymentModes')?.value as PaymentMode[]) || [];
    return selected.includes(mode);
  }

  togglePaymentMode(mode: PaymentMode): void {
    const current = (this.gatewayForm.get('paymentModes')?.value as PaymentMode[]) || [];
    const updated = current.includes(mode) ? current.filter(m => m !== mode) : [...current, mode];
    this.gatewayForm.patchValue({ paymentModes: updated });
    this.gatewayForm.get('paymentModes')?.markAsDirty();
  }

  selectAllModes(): void {
    this.gatewayForm.patchValue({ paymentModes: [...ALL_PAYMENT_MODES] });
    this.gatewayForm.get('paymentModes')?.markAsDirty();
  }

  clearAllModes(): void {
    this.gatewayForm.patchValue({ paymentModes: [] });
    this.gatewayForm.get('paymentModes')?.markAsDirty();
  }

  onSubmitGateway(): void {
    this.gatewayForm.markAllAsTouched();
    if (this.gatewayForm.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please complete all required fields.', life: 4000 });
      return;
    }

    let credentialsObj: Record<string, string> = {};
    try {
      credentialsObj = JSON.parse(this.gatewayForm.get('credentialsJson')?.value || '{}');
    } catch {
      this.messageService.add({ severity: 'error', summary: 'Invalid JSON', detail: 'Credentials JSON is formatted incorrectly.', life: 4000 });
      return;
    }

    const formVal = this.gatewayForm.value;
    const id = this.editingGatewayId();
    const payload = {
      name: formVal.name, image: formVal.image || '',
      paymentModes: formVal.paymentModes, remark: formVal.remark || '',
      credentials: credentialsObj, status: formVal.status,
    };

    this.isSaving.set(true);
    const obs$ = id ? this.service.updateGateway(id, payload) : this.service.createGateway(payload);
    obs$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (result) => {
        this.messageService.add({
          severity: 'success',
          summary: id ? 'Gateway Updated' : 'Gateway Added',
          detail: id
            ? `Payment Gateway "${result.name}" details updated successfully.`
            : `Payment Gateway "${result.name}" created successfully.`,
          life: 4000,
        });
        this.isSaving.set(false);
        this.closeModal();
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save payment gateway.', life: 4000 });
        this.isSaving.set(false);
      },
    });
  }

  onStatusChangeSubmit(event: string | { status: string; reason?: string }): void {
    const newStatus = (typeof event === 'string' ? event : event.status) as 'Active' | 'Inactive';
    const ids = this.selectedGateways.map(g => g.id);
    this.service.updateMultipleStatus(ids, newStatus).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.selectedGateways = [];
        this.statusModalVisible.set(false);
        this.messageService.add({
          severity: 'success', summary: 'Status Updated',
          detail: `Updated status to "${newStatus}" for selected gateways.`, life: 4000,
        });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not update gateway status.', life: 4000 });
      },
    });
  }
}

import {
  ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal,
  OnInit, effect,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent, DataTableComponent, ButtonComponent,
  FormModalComponent, TextFieldComponent, SelectFieldComponent,
  TableActionComponent, TableColumn, BreadcrumbItem,
} from 'admin-core';
import {
  PaymentGatewaysService, ConvenienceFeeRule, PaymentMode, ServiceType, FeeType,
} from '../payment-gateways/payment-gateways.service';

@Component({
  selector: 'app-convenience-fee',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    PageContainerComponent, DataTableComponent, ButtonComponent,
    FormModalComponent, TextFieldComponent, SelectFieldComponent, TableActionComponent,
  ],
  templateUrl: './convenience-fee.html',
  styleUrl: './convenience-fee.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConvenienceFeeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly service = inject(PaymentGatewaysService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'System' },
    { label: 'Settings', route: '/system/settings/company' },
    { label: 'Payment Gateway List', route: '/system/settings/payment-gateways' },
    { label: 'Convenience Fee' },
  ];

  readonly gateways = this.service.gateways;
  readonly feeRules = this.service.feeRules;
  readonly isLoading = this.service.loading;
  readonly isSaving = signal<boolean>(false);
  readonly editingRuleId = signal<string | null>(null);
  readonly isEditorVisible = signal<boolean>(false);
  readonly selectedGatewayId = signal<string>('');
  private gatewayInitialized = false;

  readonly currentGateway = computed(() => {
    const id = this.selectedGatewayId();
    return this.gateways().find(g => g.id === id) || this.gateways()[0] || null;
  });

  readonly gatewayOptions = computed(() =>
    this.gateways().map(g => ({ label: g.name, value: g.id }))
  );

  readonly serviceOptions = [
    { label: 'Hotel', value: 'Hotel' as ServiceType },
    { label: 'Make Payment', value: 'Make Payment' as ServiceType },
    { label: 'Flight', value: 'Flight' as ServiceType },
    { label: 'Package', value: 'Package' as ServiceType },
  ];

  readonly feeTypeOptions = [
    { label: 'Fixed', value: 'Fixed' as FeeType },
    { label: 'Percentage', value: 'Percentage' as FeeType },
  ];

  feeForm: FormGroup = this.fb.group({
    gatewayId: ['', Validators.required],
    service: ['Hotel' as ServiceType, Validators.required],
    minAmount: [1, [Validators.required, Validators.min(0)]],
    maxAmount: [1000000, [Validators.required, Validators.min(0)]],
    modesArray: this.fb.array([]),
  });

  get modesFormArray(): FormArray { return this.feeForm.get('modesArray') as FormArray; }

  readonly columns: TableColumn[] = [
    { field: 'gatewayName', header: 'Payment Gateway', sortable: true, width: '12rem' },
    { field: 'service', header: 'Service', sortable: true, width: '10rem' },
    { field: 'amountRange', header: 'Amount Range', sortable: false, width: '14rem' },
    { field: 'feesSummary', header: 'Configured Modes', sortable: false, width: '18rem' },
    { field: 'createdDate', header: 'Created Date', sortable: true, width: '13rem' },
    { field: 'actions', header: 'Action', width: '6rem', align: 'center', frozen: true, frozenAlign: 'right' },
  ];

  readonly tableData = computed(() =>
    this.feeRules().map(r => ({
      ...r,
      amountRange: `₹ ${r.minAmount?.toLocaleString() || 0} – ₹ ${r.maxAmount?.toLocaleString() || 0}`,
      feesSummary: r.feesByMode?.map(f => `${f.mode} (${f.type === 'Percentage' ? f.value + '%' : '₹' + f.value})`).join(', ') || '-',
    }))
  );

  constructor() {
    effect(() => {
      const list = this.gateways();
      if (list.length > 0 && !this.gatewayInitialized) {
        this.gatewayInitialized = true;
        const qGateway = this.route.snapshot.queryParamMap.get('gatewayId');
        const target = list.find(g => g.id === qGateway) || list[0];
        this.selectedGatewayId.set(target.id);
        this.feeForm.patchValue({ gatewayId: target.id });
        this.buildModesFormArray(target.paymentModes);
      }
    });
  }

  ngOnInit(): void {
    this.service.loadGateways();
    this.service.loadFeeRules();
  }

  onGatewayChange(newGatewayId: string): void {
    this.selectedGatewayId.set(newGatewayId);
    this.feeForm.patchValue({ gatewayId: newGatewayId });
    const gw = this.currentGateway();
    if (gw) this.buildModesFormArray(gw.paymentModes);
  }

  buildModesFormArray(modes: PaymentMode[], existingFees?: { mode: PaymentMode; value: number; type: FeeType }[]): void {
    this.modesFormArray.clear();
    modes.forEach(mode => {
      const match = existingFees?.find(e => e.mode === mode);
      const isCard = mode.toLowerCase().includes('card');
      const defaultValue = match ? match.value : isCard ? 1.85 : mode === 'Net Banking' ? 15 : 0;
      const defaultType: FeeType = match ? match.type : mode === 'Net Banking' ? 'Fixed' : 'Percentage';
      this.modesFormArray.push(this.fb.group({
        mode: [mode],
        value: [defaultValue, [Validators.required, Validators.min(0)]],
        type: [defaultType, Validators.required],
      }));
    });
  }

  goBack(): void { this.router.navigate(['/system/settings/payment-gateways']); }

  openAddFeeModal(): void {
    this.editingRuleId.set(null);
    const gw = this.currentGateway() || this.gateways()[0];
    if (gw) {
      this.selectedGatewayId.set(gw.id);
      this.feeForm.patchValue({ gatewayId: gw.id, service: 'Hotel', minAmount: 1, maxAmount: 1000000 });
      this.buildModesFormArray(gw.paymentModes);
    }
    this.isEditorVisible.set(true);
  }

  onEditRule(rule: ConvenienceFeeRule): void {
    this.editingRuleId.set(rule.id);
    this.selectedGatewayId.set(rule.gatewayId);
    this.feeForm.patchValue({
      gatewayId: rule.gatewayId, service: rule.service,
      minAmount: rule.minAmount, maxAmount: rule.maxAmount,
    });
    const gw = this.service.getGatewayById(rule.gatewayId);
    const modes = gw ? gw.paymentModes : rule.feesByMode.map(f => f.mode);
    this.buildModesFormArray(modes, rule.feesByMode);
    this.isEditorVisible.set(true);
  }

  onResetForm(): void {
    this.editingRuleId.set(null);
    const gw = this.currentGateway();
    if (gw) {
      this.feeForm.patchValue({ gatewayId: gw.id, service: 'Hotel', minAmount: 1, maxAmount: 1000000 });
      this.buildModesFormArray(gw.paymentModes);
    }
    this.messageService.add({ severity: 'info', summary: 'Form Reset', detail: 'Fee configuration reset to defaults.', life: 2500 });
  }

  onSubmitFeeConfig(): void {
    if (this.feeForm.invalid) {
      this.feeForm.markAllAsTouched();
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all fee values correctly.', life: 4000 });
      return;
    }

    const formVal = this.feeForm.value;
    const gw = this.currentGateway();
    const feesByMode = formVal.modesArray.map((m: any) => ({
      mode: m.mode as PaymentMode, value: Number(m.value) || 0, type: m.type as FeeType,
    }));

    this.isSaving.set(true);
    this.service.saveFeeRule({
      id: this.editingRuleId() ?? undefined,
      gatewayId: gw ? gw.id : formVal.gatewayId,
      gatewayName: gw ? gw.name : 'Gateway',
      service: formVal.service,
      minAmount: Number(formVal.minAmount) || 0,
      maxAmount: Number(formVal.maxAmount) || 0,
      feesByMode, status: 'Active',
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (saved) => {
        this.isSaving.set(false);
        this.editingRuleId.set(null);
        this.isEditorVisible.set(false);
        this.messageService.add({
          severity: 'success', summary: 'Convenience Fee Saved',
          detail: `Successfully saved fee rule for ${saved.gatewayName} - ${saved.service}.`, life: 4000,
        });
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: 'Could not save convenience fee rule.', life: 4000 });
      },
    });
  }

  onDeleteRule(rule: ConvenienceFeeRule): void {
    this.service.deleteFeeRule(rule.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.messageService.add({ severity: 'info', summary: 'Rule Removed', detail: `Convenience fee rule for ${rule.gatewayName} removed.`, life: 3000 });
      },
      error: () => {
        this.messageService.add({ severity: 'error', summary: 'Delete Failed', detail: 'Could not remove fee rule.', life: 3000 });
      },
    });
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  ButtonComponent,
  StatusBadgeComponent,
  TextFieldComponent,
  CheckboxFieldComponent,
  BreadcrumbItem,
} from 'admin-core';
import { AmendmentDetailService, AmendmentDetailData } from './amendment-detail.service';

@Component({
  selector: 'app-amendment-detail',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    StatusBadgeComponent,
    TextFieldComponent,
    CheckboxFieldComponent,
  ],
  templateUrl: './amendment-detail.html',
  styleUrl: './amendment-detail.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmendmentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(AmendmentDetailService);
  private readonly messageService = inject(MessageService);

  readonly amendment = signal<AmendmentDetailData>(this.load());
  readonly isSaving = signal(false);
  readonly isApproving = signal(false);
  readonly isRejecting = signal(false);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Amendments', route: '/hotel/amendments' },
    { label: 'Amendment #' + this.amendment().amendmentId },
  ];

  readonly form = new FormGroup({
    cancellationCharge:        new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    cancellationServiceCharge: new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    cancellationChargeGst:     new FormControl<number>(0, [Validators.required, Validators.min(0)]),
    refundAmount:              new FormControl<number>({ value: 0, disabled: true }),
    tdsReturn:                 new FormControl(false),
    changeBookingCurrencyRate: new FormControl(true),
    currentCurrencyRate:       new FormControl<number>(1, [Validators.required, Validators.min(0)]),
  });

  readonly showCurrencyRate = computed(() =>
    this.form.controls.changeBookingCurrencyRate.value === true
  );

  ngOnInit(): void {
    const a = this.amendment();
    this.form.patchValue({
      cancellationCharge:        a.cancellationCharge,
      cancellationServiceCharge: a.cancellationServiceCharge,
      cancellationChargeGst:     a.cancellationChargeGst,
      refundAmount:              a.refundAmount,
      tdsReturn:                 a.tdsReturn,
      changeBookingCurrencyRate: a.changeBookingCurrencyRate,
      currentCurrencyRate:       a.currentCurrencyRate,
    });

    this.form.controls.cancellationCharge.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.recalcRefund());
    this.form.controls.cancellationServiceCharge.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.recalcRefund());
    this.form.controls.cancellationChargeGst.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.recalcRefund());
  }

  private load(): AmendmentDetailData {
    const id = this.route.snapshot.paramMap.get('id') || '305';
    return this.service.getById(id);
  }

  private recalcRefund(): void {
    const a = this.amendment();
    const charge = Number(this.form.controls.cancellationCharge.value) || 0;
    const svc    = Number(this.form.controls.cancellationServiceCharge.value) || 0;
    const gst    = Number(this.form.controls.cancellationChargeGst.value) || 0;
    const refund = Math.max(0, a.publishedFare - charge - svc - gst);
    this.form.controls.refundAmount.setValue(refund, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/hotel/amendments']);
  }

  viewBookingDetails(): void {
    const bookingId = this.amendment().bookingId;
    this.router.navigate(['/hotel/bookings', bookingId, 'edit']);
  }

  onApprove(): void {
    this.isApproving.set(true);
    setTimeout(() => {
      this.isApproving.set(false);
      this.amendment.update(a => ({ ...a, amendmentStatus: 'Approved' }));
      this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Amendment has been approved.', life: 4000 });
    }, 600);
  }

  onReject(): void {
    this.isRejecting.set(true);
    setTimeout(() => {
      this.isRejecting.set(false);
      this.amendment.update(a => ({ ...a, amendmentStatus: 'Rejected' }));
      this.messageService.add({ severity: 'warn', summary: 'Rejected', detail: 'Amendment has been rejected.', life: 4000 });
    }, 600);
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 4000 });
      return;
    }
    this.isSaving.set(true);
    setTimeout(() => {
      this.isSaving.set(false);
      this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Amendment details updated successfully.', life: 4000 });
    }, 600);
  }
}

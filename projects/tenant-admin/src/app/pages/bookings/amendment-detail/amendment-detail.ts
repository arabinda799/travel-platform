import {
  ChangeDetectionStrategy, Component, DestroyRef, OnInit,
  computed, inject, signal,
} from '@angular/core';
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
import { AmendmentDetailService } from './amendment-detail.service';

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
  private readonly destroyRef = inject(DestroyRef);

  private readonly amendmentId = this.route.snapshot.paramMap.get('id') || '';

  readonly amendment = computed(() => this.service.amendment()!);
  readonly loading = this.service.loading;
  readonly isSaving = signal(false);
  readonly isApproving = signal(false);
  readonly isRejecting = signal(false);

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Hotel Bookings', route: '/bookings/hotel' },
    { label: 'Amendments', route: '/bookings/hotel/amendments' },
    { label: 'Amendment #' + this.amendmentId },
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
    this.service.loadById(this.amendmentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (a) => {
        this.form.patchValue({
          cancellationCharge:        a.cancellationCharge,
          cancellationServiceCharge: a.cancellationServiceCharge,
          cancellationChargeGst:     a.cancellationChargeGst,
          refundAmount:              a.refundAmount,
          tdsReturn:                 a.tdsReturn,
          changeBookingCurrencyRate: a.changeBookingCurrencyRate,
          currentCurrencyRate:       a.currentCurrencyRate,
        });
        this.form.controls.cancellationCharge.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.recalcRefund());
        this.form.controls.cancellationServiceCharge.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.recalcRefund());
        this.form.controls.cancellationChargeGst.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.recalcRefund());
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Load Failed', detail: 'Could not load amendment details.' }),
    });
  }

  private recalcRefund(): void {
    const a = this.amendment();
    const charge = Number(this.form.controls.cancellationCharge.value) || 0;
    const svc    = Number(this.form.controls.cancellationServiceCharge.value) || 0;
    const gst    = Number(this.form.controls.cancellationChargeGst.value) || 0;
    const refund = Math.max(0, (a?.publishedFare ?? 0) - charge - svc - gst);
    this.form.controls.refundAmount.setValue(refund, { emitEvent: false });
  }

  goBack(): void {
    this.router.navigate(['/bookings/hotel/amendments']);
  }

  viewBookingDetails(): void {
    const bookingId = this.amendment()?.bookingId;
    if (bookingId) this.router.navigate(['/bookings/hotel', bookingId, 'edit']);
  }

  onApprove(): void {
    this.isApproving.set(true);
    this.service.approve(this.amendmentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isApproving.set(false);
        this.messageService.add({ severity: 'success', summary: 'Approved', detail: 'Amendment has been approved.', life: 4000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isApproving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Approve Failed', detail: err?.error?.message || 'Could not approve amendment.', life: 4000 });
      },
    });
  }

  onReject(): void {
    this.isRejecting.set(true);
    this.service.reject(this.amendmentId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isRejecting.set(false);
        this.messageService.add({ severity: 'warn', summary: 'Rejected', detail: 'Amendment has been rejected.', life: 4000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isRejecting.set(false);
        this.messageService.add({ severity: 'error', summary: 'Reject Failed', detail: err?.error?.message || 'Could not reject amendment.', life: 4000 });
      },
    });
  }

  onSave(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.messageService.add({ severity: 'error', summary: 'Validation Error', detail: 'Please fill in all required fields.', life: 4000 });
      return;
    }
    this.isSaving.set(true);
    const v = this.form.getRawValue();
    this.service.update(this.amendmentId, {
      cancellationCharge: v.cancellationCharge ?? 0,
      cancellationServiceCharge: v.cancellationServiceCharge ?? 0,
      cancellationChargeGst: v.cancellationChargeGst ?? 0,
      refundAmount: v.refundAmount ?? 0,
      tdsReturn: v.tdsReturn ?? false,
      changeBookingCurrencyRate: v.changeBookingCurrencyRate ?? false,
      currentCurrencyRate: v.currentCurrencyRate ?? 1,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'success', summary: 'Saved', detail: 'Amendment details updated successfully.', life: 4000 });
      },
      error: (err: { error?: { message?: string } }) => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Save Failed', detail: err?.error?.message || 'Could not save amendment.', life: 4000 });
      },
    });
  }
}

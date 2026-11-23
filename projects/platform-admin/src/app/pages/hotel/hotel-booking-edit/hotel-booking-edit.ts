import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import {
  PageContainerComponent,
  ButtonComponent,
  StatusBadgeComponent,
  TextFieldComponent,
  SelectFieldComponent,
  TextareaFieldComponent,
  CheckboxFieldComponent,
  ModalComponent,
} from 'admin-core';
import {
  BookingDetailsService,
  HotelBookingDetails,
  PaymentLedgerEntry,
} from '../booking-confirmation/booking-details.service';

@Component({
  selector: 'app-hotel-booking-edit',
  standalone: true,
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    PageContainerComponent,
    ButtonComponent,
    StatusBadgeComponent,
    TextFieldComponent,
    SelectFieldComponent,
    TextareaFieldComponent,
    CheckboxFieldComponent,
    ModalComponent,
  ],
  templateUrl: './hotel-booking-edit.html',
  styleUrl: './hotel-booking-edit.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HotelBookingEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingDetailsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  readonly booking = computed(() => this.bookingService.currentBooking()!);
  readonly isSaving = signal<boolean>(false);

  // Modals state
  readonly showSummaryModal = signal<boolean>(false);
  readonly showRemarkModal = signal<boolean>(false);
  readonly activeRemark = signal<PaymentLedgerEntry | null>(null);

  // Collapsible section state
  readonly expanded = signal({
    basic: true,
    user: true,
    amendments: true,
    hotel: true,
    room: true,
    payment: true,
    fare: true,
    edit: true,
  });

  // Options
  readonly supplierOptions = [
    { label: 'CRS', value: 'CRS' },
    { label: 'Hotelbeds', value: 'Hotelbeds' },
    { label: 'Agoda', value: 'Agoda' },
    { label: 'TBO Holidays', value: 'TBO Holidays' },
    { label: 'WebBeds', value: 'WebBeds' },
    { label: 'Expedia Partner', value: 'Expedia Partner' },
    { label: 'RateHawk', value: 'RateHawk' },
    { label: 'Direct Contract', value: 'Direct Contract' },
  ];

  readonly bookingStatusOptions: { label: HotelBookingDetails['status']; value: HotelBookingDetails['status'] }[] = [
    { label: 'Confirmed', value: 'Confirmed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Cancelled', value: 'Cancelled' },
    { label: 'Checked In', value: 'Checked In' },
    { label: 'Checked Out', value: 'Checked Out' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Vouchered', value: 'Vouchered' },
  ];

  readonly paymentStatusOptions: { label: HotelBookingDetails['paymentStatus']; value: HotelBookingDetails['paymentStatus'] }[] = [
    { label: 'Successful', value: 'Successful' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
    { label: 'Partially Paid', value: 'Partially Paid' },
  ];

  fieldError(controlName: keyof typeof this.editForm.controls, message: string): string {
    const ctrl = this.editForm.controls[controlName];
    return ctrl.invalid && (ctrl.touched || ctrl.dirty) ? message : '';
  }

  // Reactive edit form
  readonly editForm = new FormGroup({
    issueSupplier: new FormControl<string>('CRS', { nonNullable: true, validators: [Validators.required] }),
    bookingStatus: new FormControl<HotelBookingDetails['status']>('Confirmed', { nonNullable: true, validators: [Validators.required] }),
    paymentStatus: new FormControl<HotelBookingDetails['paymentStatus']>('Successful', { nonNullable: true, validators: [Validators.required] }),
    confirmationNumber: new FormControl<string>('6424674325436', { nonNullable: true, validators: [Validators.required] }),
    refundBookingAmount: new FormControl<boolean>(false, { nonNullable: true }),
    deductBookingAmount: new FormControl<boolean>(false, { nonNullable: true }),
    note: new FormControl<string>('', { nonNullable: true }),
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.bookingService.loadByRef(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.syncFormWithBooking(),
        error: () => this.messageService.add({ severity: 'error', summary: 'Load Failed', detail: 'Could not load booking details.' }),
      });
    }
  }

  private syncFormWithBooking(): void {
    const b = this.booking();
    this.editForm.patchValue({
      issueSupplier: b.issueSupplier || 'CRS',
      bookingStatus: b.status || 'Confirmed',
      paymentStatus: b.paymentStatus || 'Successful',
      confirmationNumber: b.hotelConfirmationNo || b.bookingId,
      refundBookingAmount: b.refundBookingAmount || false,
      deductBookingAmount: b.deductBookingAmount || false,
      note: '',
    });
  }

  readonly stars = computed(() => {
    const count = this.booking().starRating || 4;
    return Array.from({ length: 5 }, (_, i) => i < count);
  });

  toggleSection(sectionKey: keyof ReturnType<typeof this.expanded>): void {
    this.expanded.update((state) => ({
      ...state,
      [sectionKey]: !state[sectionKey],
    }));
  }

  scrollToEdit(): void {
    this.expanded.update((s) => ({ ...s, edit: true }));
    setTimeout(() => {
      const el = document.getElementById('edit-booking-form-card');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        el.classList.add('pulse-focus');
        setTimeout(() => el.classList.remove('pulse-focus'), 1500);
      }
    }, 50);
  }

  viewConfirmation(): void {
    const id = this.booking().bookingRef || this.booking().bookingId;
    this.router.navigate(['/hotel/bookings', id]);
  }

  goBack(): void {
    this.router.navigate(['/hotel/bookings']);
  }

  openBookingSummary(): void {
    this.showSummaryModal.set(true);
  }

  closeBookingSummary(): void {
    this.showSummaryModal.set(false);
  }

  openRemarkModal(entry: PaymentLedgerEntry): void {
    this.activeRemark.set(entry);
    this.showRemarkModal.set(true);
  }

  closeRemarkModal(): void {
    this.showRemarkModal.set(false);
    this.activeRemark.set(null);
  }

  onUpdateBooking(): void {
    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fill in all required fields marked with *.',
        life: 4000,
      });
      return;
    }

    this.isSaving.set(true);
    const formVal = this.editForm.getRawValue();
    const ref = this.booking()?.bookingRef || this.route.snapshot.paramMap.get('id') || '';

    this.bookingService.updateBooking(ref, {
      issueSupplier: formVal.issueSupplier,
      status: formVal.bookingStatus,
      paymentStatus: formVal.paymentStatus,
      hotelConfirmationNo: formVal.confirmationNumber,
      refundBookingAmount: formVal.refundBookingAmount,
      deductBookingAmount: formVal.deductBookingAmount,
      note: formVal.note,
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (updated) => {
        this.isSaving.set(false);
        this.editForm.patchValue({ note: '' });
        this.messageService.add({
          severity: 'success',
          summary: 'Booking Updated',
          detail: `Booking ${updated.bookingId} details successfully updated.`,
          life: 4000,
        });
      },
      error: () => {
        this.isSaving.set(false);
        this.messageService.add({ severity: 'error', summary: 'Update Failed', detail: 'Could not update booking details.', life: 4000 });
      },
    });
  }

  onCancelEdit(): void {
    this.syncFormWithBooking();
    this.messageService.add({
      severity: 'info',
      summary: 'Changes Reverted',
      detail: 'Form controls restored to initial booking state.',
      life: 2500,
    });
  }
}

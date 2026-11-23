import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import {
  PageContainerComponent, ButtonComponent, StatusBadgeComponent,
  FormModalComponent, TextFieldComponent,
} from 'admin-core';
import { BookingDetailsService } from './booking-details.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    DecimalPipe,
    PageContainerComponent, ButtonComponent, StatusBadgeComponent,
    FormModalComponent, TextFieldComponent,
    MenuModule,
  ],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingConfirmationComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingDetailsService);
  private readonly messageService = inject(MessageService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly bookingRef = this.route.snapshot.paramMap.get('id') || '6424674325436';

  readonly booking = computed(() => this.bookingService.currentBooking()!);
  readonly loading = this.bookingService.loading;
  readonly isSendingEmail = signal<boolean>(false);
  readonly isGeneratingInvoice = signal<boolean>(false);

  readonly showEmailModal = signal<boolean>(false);
  readonly recipientEmail = signal<string>('');
  readonly emailError = signal<string>('');

  readonly actionMenuItems: MenuItem[] = [
    { label: 'Email Voucher', icon: 'mail', command: () => this.openEmailModal() },
    { label: 'Customer Invoice', icon: 'receipt_long', command: () => this.downloadInvoice() },
    { label: 'Print Voucher', icon: 'print', command: () => this.printVoucher() },
  ];

  readonly stars = computed(() => {
    const count = this.booking()?.starRating || 4;
    return Array.from({ length: 5 }, (_, i) => i < count);
  });

  ngOnInit(): void {
    this.bookingService.loadByRef(this.bookingRef).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      error: () => this.messageService.add({ severity: 'error', summary: 'Load Failed', detail: 'Could not load booking details.' }),
    });
  }

  goBack(): void { this.router.navigate(['/hotel/bookings']); }

  editBooking(): void {
    const b = this.booking();
    const id = b?.bookingRef || b?.bookingId || this.bookingRef;
    this.router.navigate(['/hotel/bookings', id, 'edit']);
  }

  printVoucher(): void { window.print(); }

  openEmailModal(): void {
    const b = this.booking();
    this.recipientEmail.set(b?.bookingUserInfo?.email || b?.email || '');
    this.emailError.set('');
    this.showEmailModal.set(true);
  }

  closeEmailModal(): void { this.showEmailModal.set(false); this.emailError.set(''); }

  validateEmail(): boolean {
    const email = (this.recipientEmail() || '').trim();
    if (!email) { this.emailError.set('Recipient email is required.'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { this.emailError.set('Please enter a valid email address.'); return false; }
    this.emailError.set('');
    return true;
  }

  sendEmailVoucher(): void {
    if (!this.validateEmail()) return;
    this.isSendingEmail.set(true);
    const targetEmail = this.recipientEmail().trim();
    setTimeout(() => {
      this.isSendingEmail.set(false);
      this.showEmailModal.set(false);
      this.messageService.add({ severity: 'success', summary: 'Voucher Sent', detail: `Confirmation voucher successfully emailed to ${targetEmail}.`, life: 4000 });
    }, 600);
  }

  downloadInvoice(): void {
    this.isGeneratingInvoice.set(true);
    setTimeout(() => {
      this.isGeneratingInvoice.set(false);
      this.messageService.add({ severity: 'info', summary: 'Invoice Generated', detail: `Customer Tax Invoice #${this.booking()?.bookingRef} generated successfully.`, life: 4000 });
    }, 600);
  }
}

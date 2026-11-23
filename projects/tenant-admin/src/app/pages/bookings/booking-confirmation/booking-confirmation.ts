import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { MenuItem, MessageService } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import {
  PageContainerComponent,
  ButtonComponent,
  StatusBadgeComponent,
  FormModalComponent,
  TextFieldComponent,
} from 'admin-core';
import { BookingDetailsService, HotelBookingDetails } from './booking-details.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [
    DecimalPipe,
    PageContainerComponent,
    ButtonComponent,
    StatusBadgeComponent,
    FormModalComponent,
    TextFieldComponent,
    MenuModule,
  ],
  templateUrl: './booking-confirmation.html',
  styleUrl: './booking-confirmation.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingConfirmationComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly bookingService = inject(BookingDetailsService);
  private readonly messageService = inject(MessageService);

  readonly booking = signal<HotelBookingDetails>(this.initBooking());
  readonly isSendingEmail = signal<boolean>(false);
  readonly isGeneratingInvoice = signal<boolean>(false);

  // Email voucher modal state
  readonly showEmailModal = signal<boolean>(false);
  readonly recipientEmail = signal<string>('');
  readonly emailError = signal<string>('');

  // Dropdown action menu items
  readonly actionMenuItems: MenuItem[] = [
    {
      label: 'Email Voucher',
      icon: 'mail',
      command: () => this.openEmailModal(),
    },
    {
      label: 'Customer Invoice',
      icon: 'receipt_long',
      command: () => this.downloadInvoice(),
    },
    {
      label: 'Print Voucher',
      icon: 'print',
      command: () => this.printVoucher(),
    },
  ];

  private initBooking(): HotelBookingDetails {
    const id = this.route.snapshot.paramMap.get('id') || '6424674325436';
    return this.bookingService.getBookingById(id);
  }

  readonly stars = computed(() => {
    const count = this.booking().starRating || 4;
    return Array.from({ length: 5 }, (_, i) => i < count);
  });

  goBack(): void {
    this.router.navigate(['/bookings/hotel']);
  }

  editBooking(): void {
    const id = this.booking().bookingRef || this.booking().bookingId;
    this.router.navigate(['/bookings/hotel', id, 'edit']);
  }

  printVoucher(): void {
    window.print();
  }

  openEmailModal(): void {
    const defaultEmail = this.booking().bookingUserInfo?.email || this.booking().email || '';
    this.recipientEmail.set(defaultEmail);
    this.emailError.set('');
    this.showEmailModal.set(true);
  }

  closeEmailModal(): void {
    this.showEmailModal.set(false);
    this.emailError.set('');
  }

  validateEmail(): boolean {
    const email = (this.recipientEmail() || '').trim();
    if (!email) {
      this.emailError.set('Recipient email is required.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.emailError.set('Please enter a valid email address.');
      return false;
    }
    this.emailError.set('');
    return true;
  }

  sendEmailVoucher(): void {
    if (!this.validateEmail()) {
      return;
    }

    this.isSendingEmail.set(true);
    const targetEmail = this.recipientEmail().trim();

    setTimeout(() => {
      this.isSendingEmail.set(false);
      this.showEmailModal.set(false);
      this.messageService.add({
        severity: 'success',
        summary: 'Voucher Sent',
        detail: `Confirmation voucher successfully emailed to ${targetEmail}.`,
        life: 4000,
      });
    }, 600);
  }

  downloadInvoice(): void {
    this.isGeneratingInvoice.set(true);
    setTimeout(() => {
      this.isGeneratingInvoice.set(false);
      this.messageService.add({
        severity: 'info',
        summary: 'Invoice Generated',
        detail: `Customer Tax Invoice #${this.booking().bookingRef} generated successfully.`,
        life: 4000,
      });
    }, 600);
  }
}

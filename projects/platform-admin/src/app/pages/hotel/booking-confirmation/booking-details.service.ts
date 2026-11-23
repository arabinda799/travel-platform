import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface RoomGuest {
  title: string;
  name: string;
  isLead: boolean;
  type: 'Adult' | 'Child';
}

export interface BookedRoom {
  roomIndex: number;
  roomType: string;
  mealPlan: string;
  bedType: string;
  amenities: string[];
  guests: RoomGuest[];
}

export interface CancellationTier {
  after: string;
  before: string;
  charges: string;
}

export interface PaymentLedgerEntry {
  slNo: number;
  bookingRefNo: string;
  invoiceNo: string;
  creditNoteNo: string;
  date: string;
  paymentType: string;
  debit: number;
  credit: number;
  balance: number;
  remark: string;
}

export interface AmendmentRecord {
  id: string;
  date: string;
  type: string;
  requestedBy: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: string;
}

export interface HotelBookingDetails {
  bookingId: string;
  bookingRef: string;
  hotelConfirmationNo: string;
  amount: number;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out' | 'Failed' | 'Vouchered';
  channelType: string;
  createdOn: string;
  bookedBy: string;
  supplier: string;
  issueSupplier: string;
  lastCancellationDate: string;
  assignUserName: string;
  bookingSource: string;
  agentInfo: { companyName: string; agentName: string; email: string; mobileNumber: string };
  bookingUserInfo: { name: string; email: string; contactNo: string };
  amendments: AmendmentRecord[];
  hotelName: string;
  starRating: number;
  address: string;
  city: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  checkInMonthYear: string;
  checkInDayDate: string;
  nights: number;
  checkOutMonthYear: string;
  checkOutDayDate: string;
  roomsCount: number;
  guestsCount: number;
  rooms: BookedRoom[];
  cancellationTiers: CancellationTier[];
  publishedPrice: number;
  agentCommission: number;
  discount: number;
  gstAmount: number;
  tds: number;
  totalAmount: number;
  paymentLedger: PaymentLedgerEntry[];
  fareBreakup: {
    markup: number; discount: number; publishedPrice: number; commEarned: number;
    tds: number; convenienceFee: number; totalAmount: number;
    gstTable: { serviceDescription: string; taxableValue: number; cgst: number; sgst: number; igst: number; total: number }[];
  };
  paymentStatus: 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Paid';
  refundBookingAmount: boolean;
  deductBookingAmount: boolean;
  notes: string[];
  auditLogs: { timestamp: string; action: string; user: string }[];
}

@Injectable({ providedIn: 'root' })
export class BookingDetailsService {
  private readonly api = inject(ApiService);

  private readonly _currentBooking = signal<HotelBookingDetails | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly currentBooking = this._currentBooking.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadByRef(ref: string): Observable<HotelBookingDetails> {
    this._loading.set(true);
    return this.api.get<HotelBookingDetails>(`/hotel-bookings/${ref}`).pipe(
      tap({
        next: (data) => { this._currentBooking.set(data); this._loading.set(false); },
        error: () => this._loading.set(false),
      })
    );
  }

  updateBooking(ref: string, updates: {
    issueSupplier?: string;
    status?: HotelBookingDetails['status'];
    paymentStatus?: HotelBookingDetails['paymentStatus'];
    hotelConfirmationNo?: string;
    refundBookingAmount?: boolean;
    deductBookingAmount?: boolean;
    note?: string;
  }): Observable<HotelBookingDetails> {
    return this.api.patch<HotelBookingDetails>(`/hotel-bookings/${ref}`, updates).pipe(
      tap((updated) => this._currentBooking.set(updated))
    );
  }

  downloadLogs(bookingId: string): void {
    const current = this._currentBooking();
    if (!current) return;
    const logContent = [
      `=============================================================`,
      `HOTEL BOOKING AUDIT LOGS - REF: ${bookingId}`,
      `Generated At: ${new Date().toISOString()}`,
      `Hotel: ${current.hotelName}`,
      `Guest: ${current.bookingUserInfo.name} (${current.bookingUserInfo.email})`,
      `Status: ${current.status} | Payment: ${current.paymentStatus}`,
      `=============================================================`,
      ``,
      `--- AUDIT HISTORY ---`,
      ...current.auditLogs.map(l => `[${l.timestamp}] [${l.user}] ${l.action}`),
      ``,
      `--- INTERNAL NOTES ---`,
      ...current.notes.map(n => `• ${n}`),
      ``,
      `--- PAYMENT PROCESS LEDGER ---`,
      ...current.paymentLedger.map(p =>
        `#${p.slNo} Ref:${p.bookingRefNo} Inv:${p.invoiceNo} Type:${p.paymentType} Debit:${p.debit} Credit:${p.credit} Bal:${p.balance}`
      ),
    ].join('\n');

    const blob = new Blob([logContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `booking_logs_${bookingId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }
}

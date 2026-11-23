import { Injectable, signal } from '@angular/core';

export interface GstBreakupRow {
  serviceDescription: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface AmendmentDetailData {
  // Amendment Info
  amendmentId: string;
  amendmentStatus: 'Approved' | 'Pending' | 'Rejected' | 'In Review';
  amendmentType: 'Cancellation' | 'Date Change' | 'Room Upgrade' | 'Guest Name Change' | 'Meal Plan Change' | 'Occupancy Change';
  remark: string;
  confirmationNumber: string;
  createdOn: string;

  // Company Info
  companyName: string;
  companyId: string;
  companyEmail: string;
  mobileNumber: string;

  // Fare Information (read-only)
  publishedFare: number;
  offeredFare: number;
  agentCommission: number;
  gstAmount: number;
  tds: number;

  // Editable Cancellation Fields
  cancellationCharge: number;
  cancellationServiceCharge: number;
  cancellationChargeGst: number;
  refundAmount: number;
  tdsReturn: boolean;
  changeBookingCurrencyRate: boolean;
  currentCurrencyRate: number;

  // Booking Basic
  bookingId: string;
  hotelName: string;
  hotelConfirmationNo: string;
  amount: number;
  bookingStatus: string;

  // Fare Breakup
  applyMarkUp: number;
  applyDiscount: number;
  publishedPrice: number;
  commEarned: number;
  tdsBreakup: number;
  convenienceFee: number;
  totalAmount: number;

  // GST
  gstRows: GstBreakupRow[];
}

const MOCK: AmendmentDetailData = {
  amendmentId: '305',
  amendmentStatus: 'Approved',
  amendmentType: 'Cancellation',
  remark: 'CANCEL WITH FULL REFUND',
  confirmationNumber: '68432059468',
  createdOn: '18 Nov 2026, 11:58 AM',
  companyName: 'ibis Mall Avenue Dubai',
  companyId: 'IND756759',
  companyEmail: 'ibis@easyflys.com',
  mobileNumber: '9207200012',
  publishedFare: 180620,
  offeredFare: 180620,
  agentCommission: 0,
  gstAmount: 0,
  tds: 0,
  cancellationCharge: 0,
  cancellationServiceCharge: 0,
  cancellationChargeGst: 0,
  refundAmount: 180620,
  tdsReturn: false,
  changeBookingCurrencyRate: true,
  currentCurrencyRate: 1,
  bookingId: '6424674325428',
  hotelName: 'ibis Mall Avenue Dubai',
  hotelConfirmationNo: '68432059468',
  amount: 180620,
  bookingStatus: 'Cancelled',
  applyMarkUp: 0,
  applyDiscount: 0,
  publishedPrice: 180620,
  commEarned: 0,
  tdsBreakup: 0,
  convenienceFee: 0,
  totalAmount: 180620,
  gstRows: [
    { serviceDescription: 'Service Charges', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 },
  ],
};

@Injectable({ providedIn: 'root' })
export class AmendmentDetailService {
  private readonly store = signal<AmendmentDetailData>(MOCK);

  getById(_id: string): AmendmentDetailData {
    return { ...this.store() };
  }

  update(partial: Partial<AmendmentDetailData>): void {
    this.store.update(s => ({ ...s, ...partial }));
  }
}

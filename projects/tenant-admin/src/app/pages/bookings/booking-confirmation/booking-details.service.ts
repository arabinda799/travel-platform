import { Injectable, signal } from '@angular/core';

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

  // Agent Info
  agentInfo: {
    companyName: string;
    agentName: string;
    email: string;
    mobileNumber: string;
  };

  // Booking User Information
  bookingUserInfo: {
    name: string;
    email: string;
    contactNo: string;
  };

  // Amendments
  amendments: AmendmentRecord[];

  // Hotel Details
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

  // Rooms & Cancellation
  rooms: BookedRoom[];
  cancellationTiers: CancellationTier[];

  // Price line
  publishedPrice: number;
  agentCommission: number;
  discount: number;
  gstAmount: number;
  tds: number;
  totalAmount: number;

  // Payment process
  paymentLedger: PaymentLedgerEntry[];

  // Fare Breakup
  fareBreakup: {
    markup: number;
    discount: number;
    publishedPrice: number;
    commEarned: number;
    tds: number;
    convenienceFee: number;
    totalAmount: number;
    gstTable: {
      serviceDescription: string;
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      total: number;
    }[];
  };

  // Edit / Audit State
  paymentStatus: 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Paid';
  refundBookingAmount: boolean;
  deductBookingAmount: boolean;
  notes: string[];
  auditLogs: { timestamp: string; action: string; user: string }[];
}

const DEFAULT_HOTEL_BOOKING: HotelBookingDetails = {
  bookingId: '6424674325436',
  bookingRef: '6424674325436',
  hotelConfirmationNo: '6424674325436',
  amount: 83200,
  status: 'Confirmed',
  channelType: 'Desktop',
  createdOn: '19 Nov 2026, 02:01 PM',
  bookedBy: 'Hasna P V',
  supplier: 'CRS',
  issueSupplier: 'CRS',
  lastCancellationDate: '05 Dec 2026, 05:30 PM',
  assignUserName: 'Hasna P V',
  bookingSource: 'B2B',

  agentInfo: {
    companyName: 'Barza Holidays',
    agentName: 'Easy Flys',
    email: 'BARZAHOLIDAYS@GMAIL.COM',
    mobileNumber: '9747505506',
  },

  bookingUserInfo: {
    name: 'neha nair',
    email: 'BARZAHOLIDAYS@GMAIL.COM',
    contactNo: '9747505506',
  },

  amendments: [],

  hotelName: 'Flora Charishma Residency',
  starRating: 4,
  address: 'Opp. Karothukuzhi Hospital, Aluva, Cochin, Aluva, Kerala 683101,Kochi,Kerala , India,683101',
  city: 'Kochi (Cochin)',
  country: 'India',
  postalCode: '683101',
  phone: '+91 484 262 4444',
  email: 'reservations@floracharishma.com',
  checkInMonthYear: 'Dec,2026',
  checkInDayDate: '21,Mon',
  nights: 32,
  checkOutMonthYear: 'Jan,2027',
  checkOutDayDate: '22,Fri',
  roomsCount: 1,
  guestsCount: 2,

  rooms: [
    {
      roomIndex: 1,
      roomType: 'Standard-EP',
      mealPlan: 'European Plan (Room Only)',
      bedType: '1 Double Bed or 2 Twin Beds',
      amenities: ['-'],
      guests: [
        { title: 'Mr', name: 'neha nair', isLead: true, type: 'Adult' },
        { title: 'Mr', name: 'meer kopi', isLead: false, type: 'Adult' },
      ],
    },
  ],

  cancellationTiers: [
    {
      after: '06-Dec-2026',
      before: '21-Dec-2026',
      charges: '100% Cancellation Charge (₹ 83,200)',
    },
    {
      after: '01-Dec-2026',
      before: '05-Dec-2026',
      charges: '₹ 15,000 Flat Cancellation Fee',
    },
    {
      after: '21-Nov-2026',
      before: '30-Nov-2026',
      charges: 'Free Cancellation (₹ 0 Charges)',
    },
  ],

  publishedPrice: 83200,
  agentCommission: 0,
  discount: 0,
  gstAmount: 0,
  tds: 0,
  totalAmount: 83200,

  paymentLedger: [
    {
      slNo: 1,
      bookingRefNo: '6424674325436',
      invoiceNo: 'HW262700000286',
      creditNoteNo: '-',
      date: '19 Nov 2026 / 2:01 PM',
      paymentType: 'Wallet',
      debit: 83200,
      credit: 0,
      balance: -79749.68,
      remark: 'Wallet deduction for hotel reservation',
    },
  ],

  fareBreakup: {
    markup: 0,
    discount: 0,
    publishedPrice: 83200,
    commEarned: 0,
    tds: 0,
    convenienceFee: 0,
    totalAmount: 83200,
    gstTable: [
      {
        serviceDescription: 'Service Charges',
        taxableValue: 0,
        cgst: 0,
        sgst: 0,
        igst: 0,
        total: 0,
      },
    ],
  },

  paymentStatus: 'Successful',
  refundBookingAmount: false,
  deductBookingAmount: false,
  notes: ['Booking confirmed via CRS gateway. Auto-voucher dispatched.'],
  auditLogs: [
    {
      timestamp: '19 Nov 2026 14:01:22',
      action: 'Booking Created and Confirmed via CRS',
      user: 'Hasna P V',
    },
    {
      timestamp: '19 Nov 2026 14:01:25',
      action: 'Payment debited from Agent Wallet (HW262700000286)',
      user: 'System Bot',
    },
  ],
};

const STORAGE_KEY = 'easyflys_hotel_booking_data';

@Injectable({
  providedIn: 'root',
})
export class BookingDetailsService {
  private readonly _currentBooking = signal<HotelBookingDetails>(this.loadInitial());
  readonly currentBooking = this._currentBooking.asReadonly();

  private loadInitial(): HotelBookingDetails {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // fallback
    }
    return DEFAULT_HOTEL_BOOKING;
  }

  private persist(booking: HotelBookingDetails): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(booking));
    } catch {
      // ignore storage errors
    }
  }

  getBookingById(refOrId: string): HotelBookingDetails {
    const current = this._currentBooking();
    if (refOrId && refOrId !== current.bookingId && refOrId !== '6424674325436') {
      return {
        ...current,
        bookingId: refOrId,
        bookingRef: refOrId,
        hotelConfirmationNo: refOrId,
      };
    }
    return current;
  }

  updateBooking(updates: {
    issueSupplier?: string;
    status?: HotelBookingDetails['status'];
    paymentStatus?: HotelBookingDetails['paymentStatus'];
    hotelConfirmationNo?: string;
    refundBookingAmount?: boolean;
    deductBookingAmount?: boolean;
    note?: string;
  }): HotelBookingDetails {
    const current = this._currentBooking();
    const updatedLogs = [...current.auditLogs];

    if (updates.note && updates.note.trim()) {
      updatedLogs.unshift({
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        action: `Admin Note added: ${updates.note.trim()}`,
        user: 'Current Admin',
      });
    }

    if (updates.status && updates.status !== current.status) {
      updatedLogs.unshift({
        timestamp: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }),
        action: `Status changed from ${current.status} to ${updates.status}`,
        user: 'Current Admin',
      });
    }

    const updated: HotelBookingDetails = {
      ...current,
      issueSupplier: updates.issueSupplier ?? current.issueSupplier,
      status: updates.status ?? current.status,
      paymentStatus: updates.paymentStatus ?? current.paymentStatus,
      hotelConfirmationNo: updates.hotelConfirmationNo ?? current.hotelConfirmationNo,
      refundBookingAmount: updates.refundBookingAmount ?? current.refundBookingAmount,
      deductBookingAmount: updates.deductBookingAmount ?? current.deductBookingAmount,
      notes: updates.note?.trim() ? [updates.note.trim(), ...current.notes] : current.notes,
      auditLogs: updatedLogs,
    };

    this._currentBooking.set(updated);
    this.persist(updated);
    return updated;
  }

  setBooking(booking: HotelBookingDetails): void {
    this._currentBooking.set(booking);
    this.persist(booking);
  }

  downloadLogs(bookingId: string): void {
    const current = this._currentBooking();
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

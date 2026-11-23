import { Entity, PrimaryGeneratedColumn, PrimaryColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export type HotelBookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Checked In' | 'Checked Out' | 'Failed' | 'Vouchered';
export type PaymentStatus = 'Successful' | 'Pending' | 'Failed' | 'Refunded' | 'Partially Paid';
export type AmendmentStatus = 'Approved' | 'Pending' | 'Rejected' | 'In Review';
export type AmendmentType = 'Cancellation' | 'Date Change' | 'Room Upgrade' | 'Guest Name Change' | 'Meal Plan Change' | 'Occupancy Change';

@Entity('trending_destinations')
export class TrendingDestination {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: '' }) tenantId: string;
  @Column() name: string;
  @Column({ nullable: true, type: 'text' }) subtitle: string | null;
  @Column({ nullable: true, type: 'text' }) imageUrl: string | null;
  @Column({ default: 1 }) sortOrder: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('popular_hotels')
export class PopularHotel {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: '' }) tenantId: string;
  @Column({ nullable: true, type: 'text' }) title: string | null;
  @Column({ nullable: true, type: 'text' }) imageUrl: string | null;
  @Column({ default: 1 }) sortOrder: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('hotel_bookings')
export class HotelBooking {
  @PrimaryColumn() bookingId: string;
  @Column({ unique: true }) bookingRef: string;
  @Column({ default: '' }) hotelConfirmationNo: string;
  @Column({ type: 'float', default: 0 }) amount: number;
  @Column({ default: 'Pending' }) status: HotelBookingStatus;
  @Column({ default: '' }) channelType: string;
  @CreateDateColumn() createdOn: Date;
  @Column({ default: '' }) bookedBy: string;
  @Column({ default: '' }) supplier: string;
  @Column({ default: '' }) issueSupplier: string;
  @Column({ nullable: true, type: 'text' }) lastCancellationDate: string | null;
  @Column({ default: '' }) assignUserName: string;
  @Column({ default: '' }) bookingSource: string;
  @Column({ type: 'simple-json', default: '{}' }) agentInfo: { companyName: string; agentName: string; email: string; mobileNumber: string };
  @Column({ type: 'simple-json', default: '{}' }) bookingUserInfo: { name: string; email: string; contactNo: string };
  @Column({ type: 'simple-json', default: '[]' }) amendments: any[];
  @Column({ default: '' }) hotelName: string;
  @Column({ default: 4 }) starRating: number;
  @Column({ default: '' }) address: string;
  @Column({ default: '' }) city: string;
  @Column({ default: '' }) country: string;
  @Column({ default: '' }) postalCode: string;
  @Column({ default: '' }) phone: string;
  @Column({ default: '' }) email: string;
  @Column({ default: '' }) checkInMonthYear: string;
  @Column({ default: '' }) checkInDayDate: string;
  @Column({ default: 1 }) nights: number;
  @Column({ default: '' }) checkOutMonthYear: string;
  @Column({ default: '' }) checkOutDayDate: string;
  @Column({ default: 1 }) roomsCount: number;
  @Column({ default: 1 }) guestsCount: number;
  @Column({ type: 'simple-json', default: '[]' }) rooms: any[];
  @Column({ type: 'simple-json', default: '[]' }) cancellationTiers: any[];
  @Column({ type: 'float', default: 0 }) publishedPrice: number;
  @Column({ type: 'float', default: 0 }) agentCommission: number;
  @Column({ type: 'float', default: 0 }) discount: number;
  @Column({ type: 'float', default: 0 }) gstAmount: number;
  @Column({ type: 'float', default: 0 }) tds: number;
  @Column({ type: 'float', default: 0 }) totalAmount: number;
  @Column({ type: 'simple-json', default: '[]' }) paymentLedger: any[];
  @Column({ type: 'simple-json', default: '{}' }) fareBreakup: any;
  @Column({ default: 'Pending' }) paymentStatus: PaymentStatus;
  @Column({ default: false }) refundBookingAmount: boolean;
  @Column({ default: false }) deductBookingAmount: boolean;
  @Column({ type: 'simple-json', default: '[]' }) notes: string[];
  @Column({ type: 'simple-json', default: '[]' }) auditLogs: { timestamp: string; action: string; user: string }[];
}

@Entity('hotel_amendments')
export class HotelAmendment {
  @PrimaryColumn() amendmentId: string;
  @Column({ default: 'Pending' }) amendmentStatus: AmendmentStatus;
  @Column() amendmentType: AmendmentType;
  @Column({ default: '' }) remark: string;
  @Column({ default: '' }) confirmationNumber: string;
  @CreateDateColumn() createdOn: Date;
  @Column({ default: '' }) companyName: string;
  @Column({ default: '' }) companyId: string;
  @Column({ default: '' }) companyEmail: string;
  @Column({ default: '' }) mobileNumber: string;
  @Column({ type: 'float', default: 0 }) publishedFare: number;
  @Column({ type: 'float', default: 0 }) offeredFare: number;
  @Column({ type: 'float', default: 0 }) agentCommission: number;
  @Column({ type: 'float', default: 0 }) gstAmount: number;
  @Column({ type: 'float', default: 0 }) tds: number;
  @Column({ type: 'float', default: 0 }) cancellationCharge: number;
  @Column({ type: 'float', default: 0 }) cancellationServiceCharge: number;
  @Column({ type: 'float', default: 0 }) cancellationChargeGst: number;
  @Column({ type: 'float', default: 0 }) refundAmount: number;
  @Column({ default: false }) tdsReturn: boolean;
  @Column({ default: true }) changeBookingCurrencyRate: boolean;
  @Column({ type: 'float', default: 1 }) currentCurrencyRate: number;
  @Column({ default: '' }) bookingId: string;
  @Column({ default: '' }) hotelName: string;
  @Column({ default: '' }) hotelConfirmationNo: string;
  @Column({ type: 'float', default: 0 }) amount: number;
  @Column({ default: '' }) bookingStatus: string;
  @Column({ type: 'float', default: 0 }) applyMarkUp: number;
  @Column({ type: 'float', default: 0 }) applyDiscount: number;
  @Column({ type: 'float', default: 0 }) publishedPrice: number;
  @Column({ type: 'float', default: 0 }) commEarned: number;
  @Column({ type: 'float', default: 0 }) tdsBreakup: number;
  @Column({ type: 'float', default: 0 }) convenienceFee: number;
  @Column({ type: 'float', default: 0 }) totalAmount: number;
  @Column({ type: 'simple-json', default: '[]' }) gstRows: { serviceDescription: string; taxableValue: number; cgst: number; sgst: number; igst: number; total: number }[];
}

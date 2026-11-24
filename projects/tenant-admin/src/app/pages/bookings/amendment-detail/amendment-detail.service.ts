import { Injectable, inject, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ApiService } from 'admin-core';

export interface GstBreakupRow {
  serviceDescription: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

export interface AmendmentDetailData {
  amendmentId: string;
  amendmentStatus: 'Approved' | 'Pending' | 'Rejected' | 'In Review';
  amendmentType: 'Cancellation' | 'Date Change' | 'Room Upgrade' | 'Guest Name Change' | 'Meal Plan Change' | 'Occupancy Change';
  remark: string;
  confirmationNumber: string;
  createdOn: string;
  companyName: string;
  companyId: string;
  companyEmail: string;
  mobileNumber: string;
  publishedFare: number;
  offeredFare: number;
  agentCommission: number;
  gstAmount: number;
  tds: number;
  cancellationCharge: number;
  cancellationServiceCharge: number;
  cancellationChargeGst: number;
  refundAmount: number;
  tdsReturn: boolean;
  changeBookingCurrencyRate: boolean;
  currentCurrencyRate: number;
  bookingId: string;
  hotelName: string;
  hotelConfirmationNo: string;
  amount: number;
  bookingStatus: string;
  applyMarkUp: number;
  applyDiscount: number;
  publishedPrice: number;
  commEarned: number;
  tdsBreakup: number;
  convenienceFee: number;
  totalAmount: number;
  gstRows: GstBreakupRow[];
}

@Injectable({ providedIn: 'root' })
export class AmendmentDetailService {
  private readonly api = inject(ApiService);

  private readonly _amendment = signal<AmendmentDetailData | null>(null);
  private readonly _loading = signal<boolean>(false);

  readonly amendment = this._amendment.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadById(id: string): Observable<AmendmentDetailData> {
    this._loading.set(true);
    return this.api.get<AmendmentDetailData>(`/hotel-amendments/${id}`).pipe(
      tap({
        next: (data) => { this._amendment.set(data); this._loading.set(false); },
        error: () => this._loading.set(false),
      })
    );
  }

  update(id: string, partial: Partial<AmendmentDetailData>): Observable<AmendmentDetailData> {
    return this.api.patch<AmendmentDetailData>(`/hotel-amendments/${id}`, partial).pipe(
      tap((updated) => this._amendment.set(updated))
    );
  }

  approve(id: string): Observable<AmendmentDetailData> {
    return this.api.patch<AmendmentDetailData>(`/hotel-amendments/${id}/approve`, {}).pipe(
      tap((updated) => this._amendment.set(updated))
    );
  }

  reject(id: string): Observable<AmendmentDetailData> {
    return this.api.patch<AmendmentDetailData>(`/hotel-amendments/${id}/reject`, {}).pipe(
      tap((updated) => this._amendment.set(updated))
    );
  }
}

import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from 'admin-core';
import { Observable, take, tap } from 'rxjs';

export interface WalletInfo {
  balance: number;
  currency: string;
  creditLimit: number;
  holdAmount: number;
  availableCredit: number;
  ledgerBalance: number;
}

export interface WalletTransactionItem {
  id: string;
  txRef: string;
  orderId?: string;
  type: 'Credit' | 'Debit';
  description: string;
  category: 'Booking Deduction' | 'Wallet Top-up' | 'Commission Credit' | 'Refund Reversal' | 'PG Settlement';
  amount: number;
  balanceAfter: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
  paymentGateway?: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly api = inject(ApiService);

  private readonly _wallet = signal<WalletInfo>({
    balance: 284500,
    currency: 'INR',
    creditLimit: 500000,
    holdAmount: 18500,
    availableCredit: 215500,
    ledgerBalance: 266000,
  });
  private readonly _transactions = signal<WalletTransactionItem[]>([]);
  private readonly _loading = signal(false);

  readonly wallet = this._wallet.asReadonly();
  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();

  loadWallet(): void {
    this._loading.set(true);
    this.api.get<WalletInfo>('/shared/finance/wallet').pipe(take(1)).subscribe({
      next: data => {
        this._wallet.set(data);
        this._loading.set(false);
      },
      error: () => this._loading.set(false),
    });
  }

  loadTransactions(): void {
    this.api.get<any>('/shared/finance/transactions').pipe(take(1)).subscribe({
      next: res => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        this._transactions.set(list);
      },
      error: () => {},
    });
  }

  topupWallet(amount: number, paymentMode: string, reference?: string, remarks?: string): Observable<WalletInfo> {
    return this.api.post<WalletInfo>('/shared/finance/wallet/topup', { amount, paymentMode, reference, remarks }).pipe(
      take(1),
      tap(updated => {
        this._wallet.set(updated);
        this.loadTransactions();
      }),
    );
  }
}

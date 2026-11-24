import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
  TemplateRef, viewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { FinanceService } from '../finance.service';
import {
  PageContainerComponent,
  BreadcrumbItem,
  ButtonComponent,
  TextFieldComponent,
  SelectFieldComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  FormModalComponent,
} from 'admin-core';

export interface WalletTransaction {
  id: string;
  txRef: string;
  type: 'Credit' | 'Debit';
  description: string;
  category: 'Booking Deduction' | 'Wallet Top-up' | 'Commission Credit' | 'Refund Reversal' | 'PG Settlement';
  amount: number;
  balanceAfter: number;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-wallet-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    PageContainerComponent,
    ButtonComponent,
    TextFieldComponent,
    SelectFieldComponent,
    DataTableComponent,
    StatusBadgeComponent,
    FormModalComponent,
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletComponent {
  private readonly messageService = inject(MessageService);
  private readonly financeService = inject(FinanceService);

  constructor() {
    this.financeService.loadWallet();
    this.financeService.loadTransactions();
  }

  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly balanceTpl = viewChild<TemplateRef<any>>('balanceTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Agency Wallet' },
  ];

  readonly balance = computed(() => this.financeService.wallet().balance);
  readonly creditLimit = computed(() => this.financeService.wallet().creditLimit);
  readonly holdAmount = computed(() => this.financeService.wallet().holdAmount);

  readonly availableBalance = computed(() => this.balance() - this.holdAmount());

  readonly showTopUpModal = signal(false);
  readonly topUpAmount = signal<number | null>(null);
  readonly paymentMethod = signal<'NetBanking' | 'UPI' | 'NEFT/RTGS'>('UPI');
  readonly searchQuery = signal<string>('');

  readonly transactions = computed<WalletTransaction[]>(() => {
    const list = this.financeService.transactions();
    if (list && list.length > 0) return list as any[];
    return this._fallbackTransactions;
  });

  private readonly _fallbackTransactions: WalletTransaction[] = [
    {
      id: 'TX-90123',
      txRef: 'WT-20261123-01',
      type: 'Credit',
      description: 'Online Wallet Top-up via Razorpay',
      category: 'Wallet Top-up',
      amount: 250000,
      balanceAfter: 1480000,
      date: '2026-11-23 14:15',
      status: 'Completed',
    },
    {
      id: 'TX-90122',
      txRef: 'WT-20261123-02',
      type: 'Debit',
      description: 'Booking payment deduction: Taj Palace (EF-HTL-90412)',
      category: 'Booking Deduction',
      amount: 103200,
      balanceAfter: 1230000,
      date: '2026-11-23 11:30',
      status: 'Completed',
    },
    {
      id: 'TX-90121',
      txRef: 'WT-20261122-01',
      type: 'Credit',
      description: 'Agent B2B Commission payout credited',
      category: 'Commission Credit',
      amount: 14720,
      balanceAfter: 1333200,
      date: '2026-11-22 18:45',
      status: 'Completed',
    },
    {
      id: 'TX-90120',
      txRef: 'WT-20261121-03',
      type: 'Credit',
      description: 'Refund credited for cancelled stay: EF-HTL-77419',
      category: 'Refund Reversal',
      amount: 32000,
      balanceAfter: 1318480,
      date: '2026-11-21 16:10',
      status: 'Completed',
    },
    {
      id: 'TX-90119',
      txRef: 'WT-20261120-05',
      type: 'Debit',
      description: 'Booking payment deduction: The Leela (EF-HTL-89102)',
      category: 'Booking Deduction',
      amount: 184000,
      balanceAfter: 1286480,
      date: '2026-11-20 10:20',
      status: 'Completed',
    },
  ];

  readonly filteredTransactions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.transactions();
    return this.transactions().filter(
      t =>
        t.txRef.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'txRef', header: 'Reference ID', sortable: true },
    { field: 'date', header: 'Timestamp', sortable: true },
    { field: 'category', header: 'Category' },
    { field: 'description', header: 'Description' },
    { field: 'type', header: 'Type', sortable: true },
    {
      field: 'amount',
      header: 'Amount',
      sortable: true,
      bodyTemplate: this.amountTpl(),
    },
    {
      field: 'balanceAfter',
      header: 'Balance After',
      bodyTemplate: this.balanceTpl(),
    },
    {
      field: 'status',
      header: 'Status',
      bodyTemplate: this.statusTpl(),
    },
  ]);

  onSearch(query: string): void {
    this.searchQuery.set(query);
  }

  openTopUp(): void {
    this.topUpAmount.set(null);
    this.showTopUpModal.set(true);
  }

  closeTopUp(): void {
    this.showTopUpModal.set(false);
  }

  submitTopUp(): void {
    const amt = this.topUpAmount();
    if (!amt || amt <= 0) {
      this.messageService.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please enter a valid top-up amount',
      });
      return;
    }

    this.financeService.topupWallet(amt, this.paymentMethod(), undefined, 'Wallet Top-up').subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Wallet Top-up',
          detail: `₹${amt.toLocaleString('en-IN')} successfully credited to wallet.`,
        });
        this.closeTopUp();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to process top-up via API',
        });
      },
    });
  }
}

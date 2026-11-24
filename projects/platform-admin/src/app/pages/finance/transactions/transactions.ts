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
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  ButtonComponent,
  DateRangePickerComponent,
  DateRangeSelection,
} from 'admin-core';

export interface FinanceTransaction {
  id: string;
  txRef: string;
  orderId: string;
  type: 'Credit' | 'Debit';
  category: 'Booking Deduction' | 'Wallet Top-up' | 'Commission Credit' | 'Refund Reversal' | 'PG Settlement';
  amount: number;
  paymentGateway: 'Razorpay' | 'Stripe' | 'Wallet' | 'Bank Transfer';
  date: string;
  status: 'Completed' | 'Pending' | 'Failed';
}

@Component({
  selector: 'app-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CurrencyPipe,
    PageContainerComponent,
    DataTableComponent,
    StatusBadgeComponent,
    ButtonComponent,
    DateRangePickerComponent,
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent {
  private readonly messageService = inject(MessageService);
  private readonly financeService = inject(FinanceService);

  constructor() {
    this.financeService.loadTransactions();
  }

  readonly amountTpl = viewChild<TemplateRef<any>>('amountTpl');
  readonly statusTpl = viewChild<TemplateRef<any>>('statusTpl');

  readonly breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', route: '/' },
    { label: 'Finance' },
    { label: 'Transactions' },
  ];

  readonly dateRange = signal<[Date, Date] | null>(null);
  readonly searchQuery = signal<string>('');

  readonly transactions = computed<FinanceTransaction[]>(() => {
    const list = this.financeService.transactions();
    if (list && list.length > 0) return list as any[];
    return this._fallbackTransactions;
  });

  private readonly _fallbackTransactions: FinanceTransaction[] = [
    {
      id: 'TX-1001',
      txRef: 'TRX-20261123-01',
      orderId: 'EF-HTL-90412',
      type: 'Debit',
      category: 'Booking Deduction',
      amount: 103200,
      paymentGateway: 'Wallet',
      date: '2026-11-23 11:30',
      status: 'Completed',
    },
    {
      id: 'TX-1002',
      txRef: 'TRX-20261123-02',
      orderId: 'WT-TOP-8812',
      type: 'Credit',
      category: 'Wallet Top-up',
      amount: 250000,
      paymentGateway: 'Razorpay',
      date: '2026-11-23 14:15',
      status: 'Completed',
    },
    {
      id: 'TX-1003',
      txRef: 'TRX-20261122-01',
      orderId: 'EF-HTL-89102',
      type: 'Credit',
      category: 'Commission Credit',
      amount: 14720,
      paymentGateway: 'Wallet',
      date: '2026-11-22 18:45',
      status: 'Completed',
    },
    {
      id: 'TX-1004',
      txRef: 'TRX-20261121-03',
      orderId: 'REF-77419',
      type: 'Credit',
      category: 'Refund Reversal',
      amount: 32000,
      paymentGateway: 'Razorpay',
      date: '2026-11-21 16:10',
      status: 'Completed',
    },
    {
      id: 'TX-1005',
      txRef: 'TRX-20261120-05',
      orderId: 'EF-HTL-84310',
      type: 'Debit',
      category: 'Booking Deduction',
      amount: 128900,
      paymentGateway: 'Stripe',
      date: '2026-11-20 10:20',
      status: 'Completed',
    },
    {
      id: 'TX-1006',
      txRef: 'TRX-20261119-02',
      orderId: 'SET-99012',
      type: 'Credit',
      category: 'PG Settlement',
      amount: 450000,
      paymentGateway: 'Bank Transfer',
      date: '2026-11-19 09:15',
      status: 'Completed',
    },
  ];

  readonly filteredTransactions = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.transactions();
    return this.transactions().filter(
      t =>
        t.txRef.toLowerCase().includes(q) ||
        t.orderId.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.paymentGateway.toLowerCase().includes(q)
    );
  });

  readonly columns = computed<TableColumn[]>(() => [
    { field: 'txRef', header: 'Transaction ID', sortable: true },
    { field: 'orderId', header: 'Order / Ref ID', sortable: true },
    { field: 'date', header: 'Timestamp', sortable: true },
    { field: 'category', header: 'Category' },
    { field: 'paymentGateway', header: 'Gateway / Mode' },
    { field: 'type', header: 'Type', sortable: true },
    {
      field: 'amount',
      header: 'Amount',
      sortable: true,
      bodyTemplate: this.amountTpl(),
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

  exportTransactions(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Export Started',
      detail: 'Generating transaction CSV report...',
    });
  }

  onDateChange(_range: DateRangeSelection): void {}
}

import {
  ChangeDetectionStrategy, Component, computed, inject, signal,
  TemplateRef, viewChild,
} from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
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
import { FinanceService } from '../finance.service';

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
    return (list ?? []) as any[];
  });

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

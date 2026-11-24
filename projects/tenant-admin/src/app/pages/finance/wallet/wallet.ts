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
  ButtonComponent,
  TextFieldComponent,
  SelectFieldComponent,
  DataTableComponent,
  TableColumn,
  StatusBadgeComponent,
  FormModalComponent,
} from 'admin-core';
import { FinanceService } from '../finance.service';

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
    return (list ?? []) as any[];
  });

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

    this.financeService.topupWallet(amt, this.paymentMethod()).subscribe({
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
          summary: 'Top-up Failed',
          detail: 'Could not complete wallet top-up',
        });
      },
    });
  }
}

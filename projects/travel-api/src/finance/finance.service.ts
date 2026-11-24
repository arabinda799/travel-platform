import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletAccount, WalletTransaction } from './entities/finance.entity';
import { paginate, PaginatedResponse } from '../common/paginate';

@Injectable()
export class FinanceService implements OnModuleInit {
  constructor(
    @InjectRepository(WalletAccount) private readonly walletRepo: Repository<WalletAccount>,
    @InjectRepository(WalletTransaction) private readonly txRepo: Repository<WalletTransaction>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.walletRepo.count() === 0) {
      await this.walletRepo.save([
        this.walletRepo.create({
          tenantId: 'easyfly',
          currency: 'INR',
          balance: 284500,
          creditLimit: 500000,
          holdAmount: 18500,
          status: 'ACTIVE',
        }),
      ]);
    }
    if (await this.txRepo.count() === 0) {
      const categories = ['Booking Deduction', 'Wallet Top-up', 'Commission Credit', 'Refund Reversal', 'PG Settlement'];
      const gateways = ['Razorpay', 'Stripe', 'Wallet', 'Bank Transfer'];
      const seedTx: Partial<WalletTransaction>[] = Array.from({ length: 25 }, (_, i) => ({
        tenantId: 'easyfly',
        txRef: `TXN-2026-${String(i + 1).padStart(4, '0')}`,
        orderId: `ORD-${String(i + 100).padStart(5, '0')}`,
        type: i % 3 === 0 ? 'Credit' : 'Debit',
        category: categories[i % categories.length],
        description: `${categories[i % categories.length]} transaction #${i + 1}`,
        amount: 1500 + ((i * 450) % 25000),
        balanceAfter: 284500 - (i * 200),
        paymentGateway: gateways[i % gateways.length],
        status: i % 8 === 0 ? 'Pending' : (i % 12 === 0 ? 'Failed' : 'Completed'),
        date: `2026-11-${String((i % 20) + 1).padStart(2, '0')}`,
      }));
      await this.txRepo.save(this.txRepo.create(seedTx as any));
    }
  }

  async getWallet(tenantId = 'easyfly'): Promise<any> {
    let wallet = await this.walletRepo.findOneBy({ tenantId });
    if (!wallet) {
      wallet = await this.walletRepo.save(this.walletRepo.create({ tenantId }));
    }
    return {
      balance: wallet.balance,
      currency: wallet.currency,
      creditLimit: wallet.creditLimit,
      holdAmount: wallet.holdAmount,
      availableCredit: wallet.creditLimit - wallet.balance,
      ledgerBalance: wallet.balance - wallet.holdAmount,
    };
  }

  async topupWallet(tenantId = 'easyfly', dto: { amount: number; paymentMode?: string; reference?: string; remarks?: string }): Promise<any> {
    const wallet = await this.walletRepo.findOneBy({ tenantId });
    if (wallet) {
      wallet.balance += Number(dto.amount);
      await this.walletRepo.save(wallet);
      const count = await this.txRepo.count();
      const tx = this.txRepo.create({
        tenantId,
        txRef: `TXN-2026-${String(count + 1).padStart(4, '0')}`,
        orderId: dto.reference || `TOP-${Date.now()}`,
        type: 'Credit',
        category: 'Wallet Top-up',
        description: dto.remarks || `Wallet top-up via ${dto.paymentMode || 'PG'}`,
        amount: Number(dto.amount),
        balanceAfter: wallet.balance,
        paymentGateway: dto.paymentMode || 'Razorpay',
        status: 'Completed',
        date: new Date().toISOString().split('T')[0],
      });
      await this.txRepo.save(tx);
    }
    return this.getWallet(tenantId);
  }

  async getTransactions(page = 1, limit = 50, tenantId = 'easyfly'): Promise<PaginatedResponse<WalletTransaction>> {
    return paginate<WalletTransaction>(this.txRepo, page, limit, { where: { tenantId }, order: { createdAt: 'DESC' } });
  }
}

import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { ConvenienceFeeRule, PaymentGateway } from './entities/payment-gateway.entity';
import { BulkStatusDto, CreateGatewayDto, SaveFeeRuleDto, UpdateGatewayDto } from './dto/payment-gateway.dto';

@Injectable()
export class PaymentGatewaysService implements OnModuleInit {
  constructor(
    @InjectRepository(PaymentGateway) private readonly gwRepo: Repository<PaymentGateway>,
    @InjectRepository(ConvenienceFeeRule) private readonly feeRepo: Repository<ConvenienceFeeRule>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.gwRepo.count() > 0) return;
    await this.gwRepo.save([
      this.gwRepo.create({ name: 'Razorpay', paymentModes: ['Credit Card', 'Debit Card', 'UPI', 'Net Banking'], remark: 'Primary gateway', credentials: { keyId: '', keySecret: '' }, status: 'Active' }),
      this.gwRepo.create({ name: 'PayU', paymentModes: ['Credit Card', 'Debit Card', 'UPI'], remark: 'Secondary gateway', credentials: { merchantKey: '', salt: '' }, status: 'Active' }),
      this.gwRepo.create({ name: 'CCAvenue', paymentModes: ['Credit Card', 'Debit Card', 'Net Banking', 'Cash Card'], remark: '', credentials: { merchantId: '', accessCode: '', workingKey: '' }, status: 'Inactive' }),
    ]);
  }

  async findAllGateways(page = 1, limit = 50): Promise<PaginatedResponse<PaymentGateway>> {
    return paginate<PaymentGateway>(this.gwRepo, page, limit, { order: { createdDate: 'ASC' } });
  }

  async findOneGateway(id: string): Promise<PaymentGateway> {
    const g = await this.gwRepo.findOneBy({ id });
    if (!g) throw new NotFoundException(`Gateway ${id} not found`);
    return g;
  }

  async createGateway(dto: CreateGatewayDto): Promise<PaymentGateway> {
    return this.gwRepo.save(this.gwRepo.create(dto));
  }

  async updateGateway(id: string, dto: UpdateGatewayDto): Promise<PaymentGateway> {
    const g = await this.findOneGateway(id);
    return this.gwRepo.save({ ...g, ...dto });
  }

  async removeGateway(id: string): Promise<void> {
    await this.findOneGateway(id);
    await this.gwRepo.delete(id);
  }

  async bulkStatusGateways(dto: BulkStatusDto): Promise<void> {
    await this.gwRepo.update({ id: In(dto.ids) }, { status: dto.status });
  }

  // ─── Fee Rules ──────────────────────────────────────────────────────────────

  async findAllFeeRules(page = 1, limit = 50): Promise<PaginatedResponse<ConvenienceFeeRule>> {
    return paginate<ConvenienceFeeRule>(this.feeRepo, page, limit, { order: { createdDate: 'ASC' } });
  }

  async saveFeeRule(dto: SaveFeeRuleDto): Promise<ConvenienceFeeRule> {
    if (dto.id) {
      const existing = await this.feeRepo.findOneBy({ id: dto.id });
      if (existing) return this.feeRepo.save({ ...existing, ...dto });
    }
    return this.feeRepo.save(this.feeRepo.create(dto));
  }

  async removeFeeRule(id: string): Promise<void> {
    const rule = await this.feeRepo.findOneBy({ id });
    if (!rule) throw new NotFoundException(`Fee rule ${id} not found`);
    await this.feeRepo.delete(id);
  }
}

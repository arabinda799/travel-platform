import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { TenantCompany, TenantBranding, TenantSmtp } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService implements OnModuleInit {
  constructor(@InjectRepository(TenantCompany) private readonly repo: Repository<TenantCompany>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ companyName: 'EasyFly Travels', companyCode: 'EASYFLY', domain: 'easyfly.travel', firmType: 'PVT_LTD', pgOwner: 'PLATFORM', status: 'ACTIVE', legalName: 'EasyFly Travels Pvt. Ltd.', gstNumber: '27AABCE1234F1Z5' }),
      this.repo.create({ companyName: 'Voyage Plus', companyCode: 'VOYAGEPLUS', domain: 'voyageplus.in', firmType: 'LLP', pgOwner: 'TENANT', status: 'ACTIVE', legalName: 'Voyage Plus LLP', gstNumber: '06AABCE5678G1Z2' }),
      this.repo.create({ companyName: 'SkyHigh Tours', companyCode: 'SKYHIGH', domain: 'skyhigh.tours', firmType: 'PROPRIETORSHIP', pgOwner: 'PLATFORM', status: 'TRIAL', legalName: null, gstNumber: '' }),
    ]);
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<TenantCompany>> {
    return paginate<TenantCompany>(this.repo, page, limit, { order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<TenantCompany> {
    const tenant = await this.repo.findOneBy({ id });
    if (!tenant) throw new NotFoundException(`Tenant ${id} not found`);
    return tenant;
  }

  async create(dto: CreateTenantDto): Promise<TenantCompany> {
    const codeTaken = await this.repo.findOneBy({ companyCode: dto.companyCode.toUpperCase() });
    if (codeTaken) throw new ConflictException(`Company code '${dto.companyCode}' already exists`);
    return this.repo.save(this.repo.create({
      ...dto,
      companyCode: dto.companyCode.toUpperCase(),
      status: (dto as any).status ?? 'TRIAL',
    }));
  }

  async update(id: string, dto: UpdateTenantDto): Promise<TenantCompany> {
    const tenant = await this.findOne(id);
    if (dto.companyCode && dto.companyCode.toUpperCase() !== tenant.companyCode) {
      const taken = await this.repo.findOne({ where: { companyCode: dto.companyCode.toUpperCase(), id: Not(id) } });
      if (taken) throw new ConflictException(`Company code '${dto.companyCode}' already exists`);
    }
    return this.repo.save({ ...tenant, ...dto, ...(dto.companyCode && { companyCode: dto.companyCode.toUpperCase() }) });
  }

  async updateBranding(id: string, branding: TenantBranding): Promise<TenantCompany> {
    const tenant = await this.findOne(id);
    tenant.branding = { ...(tenant.branding || {}), ...branding };
    return this.repo.save(tenant);
  }

  async updateSmtp(id: string, smtp: TenantSmtp): Promise<TenantCompany> {
    const tenant = await this.findOne(id);
    tenant.smtp = { ...(tenant.smtp || {}), ...smtp };
    return this.repo.save(tenant);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}

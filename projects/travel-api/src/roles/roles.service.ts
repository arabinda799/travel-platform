import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

function pid(mk: string, ak: string): string {
  return `perm-${mk.toLowerCase().replace(/_/g, '-')}-${ak.toLowerCase().replace(/_/g, '-')}`;
}

const SEED_PERMISSIONS: Record<string, string[]> = {
  DASHBOARD: ['VIEW'],
  TENANT: ['VIEW'], SETTING: ['VIEW'], ACCOUNTS: ['VIEW'], REPORT: ['VIEW'],
  FLIGHT: ['VIEW'], HOTEL: ['VIEW'], VISA: ['VIEW'], AGENT: ['VIEW'], SUPPLIER: ['VIEW'], CUSTOMER: ['VIEW'],
  COUPON: ['VIEW'], BLOG: ['VIEW'], PAGE: ['VIEW'], LOGS: ['VIEW'],
  TENANT_COMPANY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  TENANT_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD', 'IMPERSONATE', 'EXPORT'],
  TENANT_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  SETTING_COMPANY: ['EDIT'],
  SETTING_USER: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS', 'CHANGE_PASSWORD'],
  SETTING_ROLE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_WALLET: ['VIEW', 'EXPORT'],
  SETTING_CONVENIENCE_FEE: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_BANK_ACCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE'],
  SETTING_PAYMENT_GATEWAY: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  SETTING_VENDOR: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'EXPORT', 'STATUS'],
  ACCOUNTS_PAYMENT_HISTORY: ['VIEW', 'EXPORT'],
  REPORT_FLIGHT: ['VIEW', 'EXPORT'], REPORT_HOTEL: ['VIEW', 'EXPORT'], REPORT_VISA: ['VIEW', 'EXPORT'],
  HOTEL_BOOKING: ['VIEW', 'EDIT', 'EXPORT'], HOTEL_AMENDMENT: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  HOTEL_REFUND: ['VIEW', 'ADD', 'EDIT', 'EXPORT'],
  HOTEL_MARKUP: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  HOTEL_DISCOUNT: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  COUPON_HOTEL: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  CUSTOMER_MANAGE: ['VIEW', 'ADD', 'EDIT', 'DELETE', 'STATUS'],
  CUSTOMER_WALLET: ['VIEW', 'CREDIT', 'DEBIT', 'CREDIT_LIMIT', 'EXPORT'],
  LOGS_LOGIN: ['VIEW', 'EXPORT'], LOGS_EMAIL: ['VIEW', 'EXPORT', 'RESEND'],
  LOGS_SMS: ['VIEW', 'EXPORT', 'RESEND'], LOGS_COUPON: ['VIEW', 'EXPORT'],
};

const ALL_PERM_IDS: string[] = Object.entries(SEED_PERMISSIONS)
  .flatMap(([mk, actions]) => actions.map(ak => pid(mk, ak)));

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ key: 'PLATFORM_SUPER_ADMIN', name: 'Platform Super Admin', type: 'SYSTEM', scope: 'PLATFORM', ownerType: 'PLATFORM', permissionIds: ALL_PERM_IDS }),
      this.repo.create({ key: 'PLATFORM_ADMIN', name: 'Platform Admin', type: 'SYSTEM', scope: 'PLATFORM', ownerType: 'PLATFORM', permissionIds: [] }),
      this.repo.create({ key: 'PLATFORM_SUPPORT', name: 'Platform Support', type: 'SYSTEM', scope: 'PLATFORM', ownerType: 'PLATFORM', permissionIds: [] }),
      this.repo.create({ key: 'TENANT_ADMIN', name: 'Tenant Admin', type: 'SYSTEM', scope: 'TENANT', ownerType: 'PLATFORM', permissionIds: [] }),
      this.repo.create({ key: 'B2B_AGENT', name: 'B2B Agent', type: 'SYSTEM', scope: 'B2B', ownerType: 'PLATFORM', permissionIds: [] }),
      this.repo.create({ key: 'B2C_USER', name: 'B2C User', type: 'SYSTEM', scope: 'B2C', ownerType: 'PLATFORM', permissionIds: [] }),
    ]);
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<Role>> {
    return paginate<Role>(this.repo, page, limit, { order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.repo.findOneBy({ id });
    if (!role) throw new NotFoundException(`Role ${id} not found`);
    return role;
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.repo.findOneBy({ key: dto.key });
    if (existing) throw new ConflictException(`Role key '${dto.key}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, status: 'ACTIVE', permissionIds: dto.permissionIds ?? [] }));
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    return this.repo.save({ ...role, ...dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}

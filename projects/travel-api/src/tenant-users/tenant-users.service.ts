import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { TenantUser } from './entities/tenant-user.entity';
import { CreateTenantUserDto } from './dto/create-tenant-user.dto';
import { UpdateTenantUserDto, UpdatePermissionsDto } from './dto/update-tenant-user.dto';

@Injectable()
export class TenantUsersService implements OnModuleInit {
  constructor(@InjectRepository(TenantUser) private readonly repo: Repository<TenantUser>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ tenantId: 'easyfly', firstName: 'Priya', lastName: 'Sharma', email: 'priya@easyfly.travel', phone: '9800000001', roleId: 'TENANT_ADMIN', status: 'ACTIVE', isPrimary: true }),
      this.repo.create({ tenantId: 'easyfly', firstName: 'Ravi', lastName: 'Kumar', email: 'ravi@easyfly.travel', phone: '9800000002', roleId: 'B2B_AGENT', status: 'ACTIVE', isPrimary: false }),
      this.repo.create({ tenantId: 'voyageplus', firstName: 'John', lastName: 'Doe', email: 'john@voyageplus.in', phone: '9800000003', roleId: 'TENANT_ADMIN', status: 'ACTIVE', isPrimary: true }),
    ]);
  }

  async findAll(page = 1, limit = 50, tenantId?: string): Promise<PaginatedResponse<TenantUser>> {
    const where = tenantId ? { tenantId } : {};
    return paginate<TenantUser>(this.repo, page, limit, { where, order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<TenantUser> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`Tenant user ${id} not found`);
    return user;
  }

  async create(dto: CreateTenantUserDto): Promise<TenantUser> {
    const taken = await this.repo.findOne({ where: { email: dto.email.toLowerCase(), tenantId: dto.tenantId } });
    if (taken) throw new ConflictException(`Email '${dto.email}' already in use for this tenant`);
    return this.repo.save(this.repo.create({ ...dto, email: dto.email.toLowerCase(), status: dto.status ?? 'PENDING' }));
  }

  async update(id: string, dto: UpdateTenantUserDto): Promise<TenantUser> {
    const user = await this.findOne(id);
    return this.repo.save({ ...user, ...dto });
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto): Promise<TenantUser> {
    const user = await this.findOne(id);
    return this.repo.save({ ...user, disabledPermissionIds: dto.disabledPermissionIds });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}

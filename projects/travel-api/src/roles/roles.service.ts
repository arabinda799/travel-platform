import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { Role } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService implements OnModuleInit {
  constructor(@InjectRepository(Role) private readonly repo: Repository<Role>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ key: 'PLATFORM_SUPER_ADMIN', name: 'Platform Super Admin', type: 'SYSTEM', scope: 'PLATFORM', ownerType: 'PLATFORM', permissionIds: [] }),
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
}

import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import * as bcrypt from 'bcryptjs';
import { PlatformUser } from './entities/platform-user.entity';
import { CreatePlatformUserDto } from './dto/create-platform-user.dto';
import { UpdatePlatformUserDto, UpdatePermissionsDto } from './dto/update-platform-user.dto';

@Injectable()
export class PlatformUsersService implements OnModuleInit {
  constructor(@InjectRepository(PlatformUser) private readonly repo: Repository<PlatformUser>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    const hash = bcrypt.hashSync('Admin@123', 10);
    await this.repo.save([
      this.repo.create({ firstName: 'Super', lastName: 'Admin', email: 'superadmin@easyflys.com', phone: '9000000001', roleId: 'PLATFORM_SUPER_ADMIN', status: 'ACTIVE', isPrimary: true, password: hash }),
      this.repo.create({ firstName: 'Platform', lastName: 'Manager', email: 'admin@easyflys.com', phone: '9000000002', roleId: 'PLATFORM_ADMIN', status: 'ACTIVE', isPrimary: false, password: hash }),
      this.repo.create({ firstName: 'Support', lastName: 'Agent', email: 'support@easyflys.com', phone: '9000000003', roleId: 'PLATFORM_SUPPORT', status: 'ACTIVE', isPrimary: false, password: hash }),
    ]);
  }

  async findByEmail(email: string): Promise<PlatformUser | null> {
    return this.repo.createQueryBuilder('u').addSelect('u.password').where('u.email = :email', { email }).getOne();
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<PlatformUser>> {
    return paginate<PlatformUser>(this.repo, page, limit, { order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<PlatformUser> {
    const user = await this.repo.findOneBy({ id });
    if (!user) throw new NotFoundException(`Platform user ${id} not found`);
    return user;
  }

  async create(dto: CreatePlatformUserDto): Promise<PlatformUser> {
    const emailTaken = await this.repo.findOneBy({ email: dto.email.toLowerCase() });
    if (emailTaken) throw new ConflictException(`Email '${dto.email}' already in use`);
    return this.repo.save(this.repo.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email: dto.email.trim().toLowerCase(),
      phone: dto.phone.trim(),
      roleId: dto.roleId,
      status: dto.status ?? 'PENDING',
      isPrimary: dto.isPrimary ?? false,
    }));
  }

  async update(id: string, dto: UpdatePlatformUserDto): Promise<PlatformUser> {
    const user = await this.findOne(id);
    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const taken = await this.repo.findOne({ where: { email: dto.email.toLowerCase(), id: Not(id) } });
      if (taken) throw new ConflictException(`Email '${dto.email}' already in use`);
    }
    return this.repo.save({
      ...user,
      ...(dto.firstName !== undefined && { firstName: dto.firstName.trim() }),
      ...(dto.lastName !== undefined && { lastName: dto.lastName.trim() }),
      ...(dto.email !== undefined && { email: dto.email.trim().toLowerCase() }),
      ...(dto.phone !== undefined && { phone: dto.phone.trim() }),
      ...(dto.roleId !== undefined && { roleId: dto.roleId }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.isPrimary !== undefined && { isPrimary: dto.isPrimary }),
    });
  }

  async updatePermissions(id: string, dto: UpdatePermissionsDto): Promise<PlatformUser> {
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

  async findByEmailSafe(email: string): Promise<PlatformUser | null> {
    return this.repo.findOneBy({ email });
  }

  async findByIdWithPassword(id: string): Promise<PlatformUser | null> {
    return this.repo.createQueryBuilder('u').addSelect('u.password').where('u.id = :id', { id }).getOne();
  }

  async findByResetToken(token: string): Promise<PlatformUser | null> {
    return this.repo.createQueryBuilder('u').addSelect('u.resetToken').where('u.resetToken = :token', { token }).getOne();
  }

  async setResetToken(id: string, token: string): Promise<void> {
    await this.repo.update(id, { resetToken: token } as any);
  }

  async clearResetToken(id: string): Promise<void> {
    await this.repo.update(id, { resetToken: null } as any);
  }

  async setPassword(id: string, hashedPassword: string): Promise<void> {
    await this.repo.update(id, { password: hashedPassword });
  }
}

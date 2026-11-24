import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { Vendor } from './entities/vendor.entity';
import { CreateVendorDto, UpdateVendorDto } from './dto/vendor.dto';

@Injectable()
export class VendorsService implements OnModuleInit {
  constructor(@InjectRepository(Vendor) private readonly repo: Repository<Vendor>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ name: 'Hotelbeds', code: 'HOTELBEDS', services: ['HOTEL'], mode: 'LIVE', apiUrl: 'https://api.test.hotelbeds.com', authType: 'API_KEY', credentials: { apiKey: '', secret: '' }, latencyMs: 142, healthStatus: 'Healthy', isActive: true }),
      this.repo.create({ name: 'Amadeus', code: 'AMADEUS', services: ['FLIGHT', 'HOTEL'], mode: 'LIVE', apiUrl: 'https://test.api.amadeus.com', authType: 'BEARER_TOKEN', credentials: { clientId: '', clientSecret: '' }, latencyMs: 213, healthStatus: 'Healthy', isActive: true }),
      this.repo.create({ name: 'TBO Holidays', code: 'TBOHOLIDAYS', services: ['HOTEL', 'HOLIDAY', 'BUS'], mode: 'TEST', apiUrl: 'https://api.tboholidays.com', authType: 'BASIC_AUTH', credentials: { username: '', password: '' }, latencyMs: 390, healthStatus: 'Degraded', isActive: false }),
    ]);
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<Vendor>> {
    return paginate<Vendor>(this.repo, page, limit, { order: { name: 'ASC' } });
  }

  async findOne(id: string): Promise<Vendor> {
    const v = await this.repo.findOneBy({ id });
    if (!v) throw new NotFoundException(`Vendor ${id} not found`);
    return v;
  }

  async create(dto: CreateVendorDto): Promise<Vendor> {
    const taken = await this.repo.findOneBy({ code: dto.code.toUpperCase() });
    if (taken) throw new ConflictException(`Vendor code '${dto.code}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, code: dto.code.toUpperCase() }));
  }

  async update(id: string, dto: UpdateVendorDto): Promise<Vendor> {
    const v = await this.findOne(id);
    return this.repo.save({ ...v, ...dto } as any);
  }

  async ping(id: string): Promise<Vendor> {
    const v = await this.findOne(id);
    v.latencyMs = Math.floor(Math.random() * 150) + 50;
    v.healthStatus = 'Healthy';
    return this.repo.save(v);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}

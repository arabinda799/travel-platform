import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { ConvenienceFee } from './entities/convenience-fee.entity';
import { CreateConvenienceFeeDto, UpdateConvenienceFeeDto } from './dto/convenience-fee.dto';

@Injectable()
export class ConvenienceFeesService {
  constructor(@InjectRepository(ConvenienceFee) private readonly repo: Repository<ConvenienceFee>) {}

  findAll(page = 1, limit = 50): Promise<PaginatedResponse<ConvenienceFee>> {
    return paginate(this.repo, page, limit, { order: { createdAt: 'ASC' } });
  }

  async findOne(id: string): Promise<ConvenienceFee> {
    const item = await this.repo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Convenience fee ${id} not found`);
    return item;
  }

  create(dto: CreateConvenienceFeeDto): Promise<ConvenienceFee> {
    const entity = this.repo.create({ ...dto, isActive: dto.isActive ?? true } as any) as unknown as ConvenienceFee;
    return this.repo.save(entity);
  }

  async update(id: string, dto: UpdateConvenienceFeeDto): Promise<ConvenienceFee> {
    const item = await this.findOne(id);
    return this.repo.save({ ...item, ...dto } as any);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.repo.delete({ id: In(ids) });
  }
}

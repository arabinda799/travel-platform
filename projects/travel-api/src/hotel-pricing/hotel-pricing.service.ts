import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { HotelMarkup, HotelDiscount } from './entities/hotel-pricing.entity';
import { CreateMarkupDto, UpdateMarkupDto, CreateDiscountDto, UpdateDiscountDto, BulkStatusDto, BulkDeleteDto } from './dto/hotel-pricing.dto';

@Injectable()
export class HotelPricingService implements OnModuleInit {
  constructor(
    @InjectRepository(HotelMarkup) private readonly markupRepo: Repository<HotelMarkup>,
    @InjectRepository(HotelDiscount) private readonly discountRepo: Repository<HotelDiscount>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.markupRepo.count() === 0) {
      await this.markupRepo.save([
        this.markupRepo.create({ markupFor: 'B2B', regionTypes: ['Domestic'], hotelMarkupType: 'Percentage', displayMarkup: 'In Room Rate', value: 5, status: 'Active' }),
        this.markupRepo.create({ markupFor: 'B2C', regionTypes: ['International'], hotelMarkupType: 'Fixed', displayMarkup: 'Separate Line Item', value: 500, status: 'Active' }),
      ]);
    }
    if (await this.discountRepo.count() === 0) {
      await this.discountRepo.save([
        this.discountRepo.create({ markupFor: 'B2C', regionTypes: ['Domestic'], value: 10, maxLimit: 2000, status: 'Active' }),
      ]);
    }
  }

  // ─── Markups ──────────────────────────────────────────────────────────────

  async findAllMarkups(page = 1, limit = 50): Promise<PaginatedResponse<HotelMarkup>> {
    return paginate<HotelMarkup>(this.markupRepo, page, limit, { order: { createdDate: 'ASC' } });
  }

  async findOneMarkup(id: string): Promise<HotelMarkup> {
    const m = await this.markupRepo.findOneBy({ id });
    if (!m) throw new NotFoundException(`Markup ${id} not found`);
    return m;
  }

  async createMarkup(dto: CreateMarkupDto): Promise<HotelMarkup> {
    return this.markupRepo.save(this.markupRepo.create(dto));
  }

  async updateMarkup(id: string, dto: UpdateMarkupDto): Promise<HotelMarkup> {
    const m = await this.findOneMarkup(id);
    return this.markupRepo.save({ ...m, ...dto });
  }

  async removeMarkup(id: string): Promise<void> {
    await this.findOneMarkup(id);
    await this.markupRepo.delete(id);
  }

  async bulkStatusMarkups(dto: BulkStatusDto): Promise<void> {
    await this.markupRepo.update({ id: In(dto.ids) }, { status: dto.status });
  }

  async bulkDeleteMarkups(dto: BulkDeleteDto): Promise<void> {
    await this.markupRepo.delete({ id: In(dto.ids) });
  }

  // ─── Discounts ─────────────────────────────────────────────────────────────

  async findAllDiscounts(page = 1, limit = 50): Promise<PaginatedResponse<HotelDiscount>> {
    return paginate<HotelDiscount>(this.discountRepo, page, limit, { order: { createdDate: 'ASC' } });
  }

  async findOneDiscount(id: string): Promise<HotelDiscount> {
    const d = await this.discountRepo.findOneBy({ id });
    if (!d) throw new NotFoundException(`Discount ${id} not found`);
    return d;
  }

  async createDiscount(dto: CreateDiscountDto): Promise<HotelDiscount> {
    return this.discountRepo.save(this.discountRepo.create(dto));
  }

  async updateDiscount(id: string, dto: UpdateDiscountDto): Promise<HotelDiscount> {
    const d = await this.findOneDiscount(id);
    return this.discountRepo.save({ ...d, ...dto });
  }

  async removeDiscount(id: string): Promise<void> {
    await this.findOneDiscount(id);
    await this.discountRepo.delete(id);
  }

  async bulkStatusDiscounts(dto: BulkStatusDto): Promise<void> {
    await this.discountRepo.update({ id: In(dto.ids) }, { status: dto.status });
  }

  async bulkDeleteDiscounts(dto: BulkDeleteDto): Promise<void> {
    await this.discountRepo.delete({ id: In(dto.ids) });
  }
}

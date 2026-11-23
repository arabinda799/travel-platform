import { Injectable, NotFoundException, ConflictException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { HotelCoupon } from './entities/hotel-coupon.entity';
import { CreateCouponDto, UpdateCouponDto, BulkDeleteDto } from './dto/hotel-coupon.dto';

@Injectable()
export class HotelCouponsService implements OnModuleInit {
  constructor(@InjectRepository(HotelCoupon) private readonly repo: Repository<HotelCoupon>) {}

  async onModuleInit(): Promise<void> {
    if (await this.repo.count() > 0) return;
    await this.repo.save([
      this.repo.create({ couponCode: 'HOTEL10', couponText: 'Get 10% off on hotels', couponType: 'Percentage', value: 10, couponUseLimit: 100, couponMaxLimit: 2000, showOnList: 'Yes', status: 'Active', validFromDate: '2026-01-01', validToDate: '2026-12-31' }),
      this.repo.create({ couponCode: 'FLAT500', couponText: '₹500 flat discount', couponType: 'Fixed', value: 500, couponUseLimit: 50, couponMaxLimit: 500, showOnList: 'Yes', status: 'Active', validFromDate: '2026-01-01', validToDate: '2026-06-30' }),
      this.repo.create({ couponCode: 'SUMMER20', couponText: 'Summer special 20% off', couponType: 'Percentage', value: 20, couponUseLimit: 200, couponMaxLimit: 3000, showOnList: 'Yes', status: 'Inactive', validFromDate: '2026-04-01', validToDate: '2026-06-30' }),
    ]);
  }

  async findAll(page = 1, limit = 50): Promise<PaginatedResponse<HotelCoupon>> {
    return paginate<HotelCoupon>(this.repo, page, limit, { order: { createdAt: 'DESC' } });
  }

  async findOne(id: string): Promise<HotelCoupon> {
    const c = await this.repo.findOneBy({ id });
    if (!c) throw new NotFoundException(`Coupon ${id} not found`);
    return c;
  }

  async create(dto: CreateCouponDto): Promise<HotelCoupon> {
    const taken = await this.repo.findOneBy({ couponCode: dto.couponCode.toUpperCase() });
    if (taken) throw new ConflictException(`Coupon code '${dto.couponCode}' already exists`);
    return this.repo.save(this.repo.create({ ...dto, couponCode: dto.couponCode.toUpperCase() }));
  }

  async update(id: string, dto: UpdateCouponDto): Promise<HotelCoupon> {
    const c = await this.findOne(id);
    return this.repo.save({ ...c, ...dto });
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);
    await this.repo.delete(id);
  }

  async bulkRemove(dto: BulkDeleteDto): Promise<void> {
    await this.repo.delete({ id: In(dto.ids) });
  }
}

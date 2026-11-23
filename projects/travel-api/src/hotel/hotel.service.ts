import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import { TrendingDestination, PopularHotel, HotelBooking, HotelAmendment } from './entities/hotel.entity';
import {
  CreateTrendingDestinationDto, UpdateTrendingDestinationDto,
  CreatePopularHotelDto, UpdatePopularHotelDto,
  UpdateBookingDto, UpdateAmendmentDto,
} from './dto/hotel.dto';

@Injectable()
export class HotelService implements OnModuleInit {
  constructor(
    @InjectRepository(TrendingDestination) private readonly destRepo: Repository<TrendingDestination>,
    @InjectRepository(PopularHotel) private readonly hotelRepo: Repository<PopularHotel>,
    @InjectRepository(HotelBooking) private readonly bookingRepo: Repository<HotelBooking>,
    @InjectRepository(HotelAmendment) private readonly amendRepo: Repository<HotelAmendment>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.destRepo.count() === 0) {
      await this.destRepo.save([
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Dubai', subtitle: '1,240 properties', imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80', sortOrder: 1, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Bali', subtitle: '980 properties', imageUrl: 'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?w=400&q=80', sortOrder: 2, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Goa', subtitle: '850 properties', imageUrl: 'https://images.unsplash.com/photo-1587922546307-776227941871?w=400&q=80', sortOrder: 3, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Bangkok', subtitle: '1,890 properties', imageUrl: 'https://images.unsplash.com/photo-1508009603885-50cf7c579365?w=400&q=80', sortOrder: 4, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Paris', subtitle: '2,100 properties', imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=400&q=80', sortOrder: 5, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Singapore', subtitle: '760 properties', imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&q=80', sortOrder: 6, isActive: false }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'Maldives', subtitle: '320 properties', imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=400&q=80', sortOrder: 7, isActive: true }),
        this.destRepo.create({ tenantId: 'tenant-easyfly', name: 'London', subtitle: '3,500 properties', imageUrl: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=400&q=80', sortOrder: 8, isActive: false }),
      ]);
    }
    if (await this.hotelRepo.count() === 0) {
      await this.hotelRepo.save([
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'Taj Palace New Delhi', imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80', sortOrder: 1, isActive: true }),
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'Oberoi Udaivilas Udaipur', imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80', sortOrder: 2, isActive: true }),
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'The Leela Palace Bengaluru', imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400&q=80', sortOrder: 3, isActive: true }),
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'ITC Grand Chola Chennai', imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=80', sortOrder: 4, isActive: true }),
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'Marriott Resort Goa', imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&q=80', sortOrder: 5, isActive: true }),
        this.hotelRepo.create({ tenantId: 'tenant-easyfly', title: 'Hyatt Regency Mumbai', imageUrl: 'https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&q=80', sortOrder: 6, isActive: false }),
      ]);
    }
    if (await this.bookingRepo.count() === 0) {
      await this.bookingRepo.save([
        this.bookingRepo.create({
          bookingId: '6424674325436', bookingRef: '6424674325436', hotelConfirmationNo: '6424674325436',
          amount: 83200, status: 'Confirmed', channelType: 'Desktop',
          bookedBy: 'Hasna P V', supplier: 'CRS', issueSupplier: 'CRS',
          lastCancellationDate: '05 Dec 2026, 05:30 PM', assignUserName: 'Hasna P V', bookingSource: 'B2B',
          agentInfo: { companyName: 'Barza Holidays', agentName: 'Easy Flys', email: 'BARZAHOLIDAYS@GMAIL.COM', mobileNumber: '9747505506' },
          bookingUserInfo: { name: 'neha nair', email: 'BARZAHOLIDAYS@GMAIL.COM', contactNo: '9747505506' },
          amendments: [],
          hotelName: 'Flora Charishma Residency', starRating: 4,
          address: 'Opp. Karothukuzhi Hospital, Aluva, Cochin, Aluva, Kerala 683101', city: 'Kochi (Cochin)', country: 'India', postalCode: '683101', phone: '+91 484 262 4444', email: 'reservations@floracharishma.com',
          checkInMonthYear: 'Dec,2026', checkInDayDate: '21,Mon', nights: 32, checkOutMonthYear: 'Jan,2027', checkOutDayDate: '22,Fri',
          roomsCount: 1, guestsCount: 2,
          rooms: [{ roomIndex: 1, roomType: 'Standard-EP', mealPlan: 'European Plan (Room Only)', bedType: '1 Double Bed or 2 Twin Beds', guests: [{ title: 'Mr', name: 'neha nair', isLead: true, type: 'Adult' }, { title: 'Mr', name: 'meer kopi', isLead: false, type: 'Adult' }] }],
          cancellationTiers: [{ after: '06-Dec-2026', before: '21-Dec-2026', charges: '100% Cancellation Charge (₹ 83,200)' }, { after: '21-Nov-2026', before: '30-Nov-2026', charges: 'Free Cancellation (₹ 0 Charges)' }],
          publishedPrice: 83200, agentCommission: 0, discount: 0, gstAmount: 0, tds: 0, totalAmount: 83200,
          paymentLedger: [{ slNo: 1, bookingRefNo: '6424674325436', invoiceNo: 'HW262700000286', date: '19 Nov 2026', paymentType: 'Wallet', debit: 83200, credit: 0, balance: -79749.68 }],
          fareBreakup: { markup: 0, discount: 0, publishedPrice: 83200, commEarned: 0, tds: 0, convenienceFee: 0, totalAmount: 83200 },
          paymentStatus: 'Successful', refundBookingAmount: false, deductBookingAmount: false,
          notes: ['Booking confirmed via CRS gateway. Auto-voucher dispatched.'],
          auditLogs: [{ timestamp: '19 Nov 2026 14:01:22', action: 'Booking Created and Confirmed via CRS', user: 'Hasna P V' }],
        }),
      ]);
    }
    if (await this.amendRepo.count() === 0) {
      await this.amendRepo.save([
        this.amendRepo.create({
          amendmentId: '305', amendmentStatus: 'Approved', amendmentType: 'Cancellation',
          remark: 'CANCEL WITH FULL REFUND', confirmationNumber: '68432059468',
          companyName: 'ibis Mall Avenue Dubai', companyId: 'IND756759', companyEmail: 'ibis@easyflys.com', mobileNumber: '9207200012',
          publishedFare: 180620, offeredFare: 180620, agentCommission: 0, gstAmount: 0, tds: 0,
          cancellationCharge: 0, cancellationServiceCharge: 0, cancellationChargeGst: 0, refundAmount: 180620,
          tdsReturn: false, changeBookingCurrencyRate: true, currentCurrencyRate: 1,
          bookingId: '6424674325428', hotelName: 'ibis Mall Avenue Dubai', hotelConfirmationNo: '68432059468',
          amount: 180620, bookingStatus: 'Cancelled',
          applyMarkUp: 0, applyDiscount: 0, publishedPrice: 180620, commEarned: 0, tdsBreakup: 0, convenienceFee: 0, totalAmount: 180620,
          gstRows: [{ serviceDescription: 'Service Charges', taxableValue: 0, cgst: 0, sgst: 0, igst: 0, total: 0 }],
        }),
      ]);
    }
  }

  // ─── Trending Destinations ───────────────────────────────────────────────────

  async findAllDestinations(page = 1, limit = 50): Promise<PaginatedResponse<TrendingDestination>> {
    return paginate<TrendingDestination>(this.destRepo, page, limit, { order: { sortOrder: 'ASC' } });
  }

  async createDestination(dto: CreateTrendingDestinationDto): Promise<TrendingDestination> {
    return this.destRepo.save(this.destRepo.create({ ...dto, tenantId: 'tenant-easyfly', subtitle: dto.subtitle ?? null, imageUrl: dto.imageUrl ?? null }));
  }

  async updateDestination(id: string, dto: UpdateTrendingDestinationDto): Promise<TrendingDestination> {
    const existing = await this.destRepo.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Destination ${id} not found`);
    return this.destRepo.save({ ...existing, ...dto });
  }

  async removeDestination(id: string): Promise<void> {
    if (!await this.destRepo.findOneBy({ id })) throw new NotFoundException(`Destination ${id} not found`);
    await this.destRepo.delete(id);
  }

  async bulkRemoveDestinations(ids: string[]): Promise<void> {
    await this.destRepo.delete({ id: In(ids) });
  }

  // ─── Popular Hotels ──────────────────────────────────────────────────────────

  async findAllHotels(page = 1, limit = 50): Promise<PaginatedResponse<PopularHotel>> {
    return paginate<PopularHotel>(this.hotelRepo, page, limit, { order: { sortOrder: 'ASC' } });
  }

  async createHotel(dto: CreatePopularHotelDto): Promise<PopularHotel> {
    return this.hotelRepo.save(this.hotelRepo.create({ ...dto, tenantId: 'tenant-easyfly', title: dto.title ?? null, imageUrl: dto.imageUrl ?? null }));
  }

  async updateHotel(id: string, dto: UpdatePopularHotelDto): Promise<PopularHotel> {
    const existing = await this.hotelRepo.findOneBy({ id });
    if (!existing) throw new NotFoundException(`Hotel ${id} not found`);
    return this.hotelRepo.save({ ...existing, ...dto });
  }

  async removeHotel(id: string): Promise<void> {
    if (!await this.hotelRepo.findOneBy({ id })) throw new NotFoundException(`Hotel ${id} not found`);
    await this.hotelRepo.delete(id);
  }

  async bulkRemoveHotels(ids: string[]): Promise<void> {
    await this.hotelRepo.delete({ id: In(ids) });
  }

  // ─── Bookings ────────────────────────────────────────────────────────────────

  async findBookingById(ref: string): Promise<HotelBooking> {
    const booking = await this.bookingRepo.findOneBy({ bookingRef: ref });
    if (!booking) throw new NotFoundException(`Booking ${ref} not found`);
    return booking;
  }

  async updateBooking(ref: string, dto: UpdateBookingDto): Promise<HotelBooking> {
    const booking = await this.findBookingById(ref);
    const logs = [...booking.auditLogs];
    const ts = new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });
    if (dto.note?.trim()) logs.unshift({ timestamp: ts, action: `Admin Note added: ${dto.note.trim()}`, user: 'Current Admin' });
    if (dto.status && dto.status !== booking.status) logs.unshift({ timestamp: ts, action: `Status changed from ${booking.status} to ${dto.status}`, user: 'Current Admin' });
    return this.bookingRepo.save({
      ...booking,
      issueSupplier: dto.issueSupplier ?? booking.issueSupplier,
      status: (dto.status as any) ?? booking.status,
      paymentStatus: (dto.paymentStatus as any) ?? booking.paymentStatus,
      hotelConfirmationNo: dto.hotelConfirmationNo ?? booking.hotelConfirmationNo,
      refundBookingAmount: dto.refundBookingAmount ?? booking.refundBookingAmount,
      deductBookingAmount: dto.deductBookingAmount ?? booking.deductBookingAmount,
      notes: dto.note?.trim() ? [dto.note.trim(), ...booking.notes] : booking.notes,
      auditLogs: logs,
    });
  }

  // ─── Amendments ──────────────────────────────────────────────────────────────

  async findAmendmentById(id: string): Promise<HotelAmendment> {
    const amendment = await this.amendRepo.findOneBy({ amendmentId: id });
    if (!amendment) throw new NotFoundException(`Amendment ${id} not found`);
    return amendment;
  }

  async updateAmendment(id: string, dto: UpdateAmendmentDto): Promise<HotelAmendment> {
    const existing = await this.findAmendmentById(id);
    return this.amendRepo.save({ ...existing, ...dto });
  }

  async approveAmendment(id: string): Promise<HotelAmendment> {
    return this.updateAmendment(id, { amendmentStatus: 'Approved' });
  }

  async rejectAmendment(id: string): Promise<HotelAmendment> {
    return this.updateAmendment(id, { amendmentStatus: 'Rejected' });
  }
}

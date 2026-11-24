import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { paginate, PaginatedResponse } from '../common/paginate';
import {
  TrendingDestination,
  PopularHotel,
  HotelBooking,
  HotelAmendment,
  HotelBookingRecord,
  HotelAmendmentRecord,
  HotelRefundRecord,
  HotelQueryRecord,
} from './entities/hotel.entity';
import {
  CreateTrendingDestinationDto, UpdateTrendingDestinationDto,
  CreatePopularHotelDto, UpdatePopularHotelDto,
  UpdateBookingDto, UpdateAmendmentDto,
  BulkStatusDto,
} from './dto/hotel.dto';

@Injectable()
export class HotelService implements OnModuleInit {
  constructor(
    @InjectRepository(TrendingDestination) private readonly destRepo: Repository<TrendingDestination>,
    @InjectRepository(PopularHotel) private readonly hotelRepo: Repository<PopularHotel>,
    @InjectRepository(HotelBooking) private readonly bookingRepo: Repository<HotelBooking>,
    @InjectRepository(HotelAmendment) private readonly amendRepo: Repository<HotelAmendment>,
    @InjectRepository(HotelBookingRecord) private readonly bookingRecRepo: Repository<HotelBookingRecord>,
    @InjectRepository(HotelAmendmentRecord) private readonly amendRecRepo: Repository<HotelAmendmentRecord>,
    @InjectRepository(HotelRefundRecord) private readonly refundRecRepo: Repository<HotelRefundRecord>,
    @InjectRepository(HotelQueryRecord) private readonly queryRecRepo: Repository<HotelQueryRecord>,
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
    if (await this.bookingRecRepo.count() === 0) {
      const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
      const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
      const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi', 'Ananya Das', 'Karan Malhotra', 'Deepa Nair'];
      const statuses = ['Confirmed', 'Pending', 'Cancelled', 'Checked In', 'Checked Out'];
      const seedBookings: Partial<HotelBookingRecord>[] = Array.from({ length: 30 }, (_, i) => ({
        bookingRef: `BK-2026-${String(i + 1).padStart(4, '0')}`,
        guestName: names[i % names.length],
        hotel: hotels[i % hotels.length],
        city: cities[i % cities.length],
        checkIn: `2026-12-${String((i % 20) + 1).padStart(2, '0')}`,
        checkOut: `2026-12-${String((i % 20) + 5).padStart(2, '0')}`,
        rooms: (i % 3) + 1,
        amount: 4500 + ((i * 350) % 25000),
        paymentMethod: 'Credit Card (Visa)',
        paymentStatus: i % 4 === 0 ? 'Pending' : 'Paid',
        assignedUser: names[(i + 2) % names.length],
        supplier: 'Hotelbeds',
        bookingDate: '2026-11-20',
        status: statuses[i % statuses.length],
      }));
      await this.bookingRecRepo.save(this.bookingRecRepo.create(seedBookings as any));
    }
    if (await this.amendRecRepo.count() === 0) {
      const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
      const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
      const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi'];
      const types = ['Date Change', 'Room Upgrade', 'Guest Name Change', 'Meal Plan Change', 'Occupancy Change'];
      const amendStatuses = ['Approved', 'Pending', 'Rejected', 'In Review'];
      const seedAmendments: Partial<HotelAmendmentRecord>[] = Array.from({ length: 20 }, (_, i) => ({
        amendmentId: `AMD-${String(i + 1).padStart(4, '0')}`,
        bookingId: `BK-2026-${String(i + 10).padStart(4, '0')}`,
        amendmentType: types[i % types.length],
        amendmentStatus: amendStatuses[i % amendStatuses.length],
        bookingStatus: 'Confirmed',
        bookingAmount: 5000 + ((i * 400) % 30000),
        hotel: hotels[i % hotels.length],
        guest: names[i % names.length],
        pax: '2 Adults',
        checkIn: `2026-12-${String((i % 20) + 2).padStart(2, '0')}`,
        checkOut: `2026-12-${String((i % 20) + 6).padStart(2, '0')}`,
        city: cities[i % cities.length],
        assignedStaff: names[(i + 1) % names.length],
        bookingDate: '2026-11-18',
        createdDate: '2026-11-21',
      }));
      await this.amendRecRepo.save(this.amendRecRepo.create(seedAmendments as any));
    }
    if (await this.refundRecRepo.count() === 0) {
      const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
      const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
      const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi'];
      const refundStatuses = ['Processed', 'Pending', 'Initiated', 'Failed'];
      const seedRefunds: Partial<HotelRefundRecord>[] = Array.from({ length: 20 }, (_, i) => ({
        refundId: `REF-${String(i + 1).padStart(4, '0')}`,
        amendmentId: `AMD-${String(i + 1).padStart(4, '0')}`,
        bookingId: `BK-2026-${String(i + 20).padStart(4, '0')}`,
        amendmentType: 'Full Cancellation',
        refundStatus: refundStatuses[i % refundStatuses.length],
        amendmentStatus: 'Approved',
        bookingStatus: 'Cancelled',
        bookingAmount: 6000 + ((i * 500) % 40000),
        hotel: hotels[i % hotels.length],
        guest: names[i % names.length],
        pax: '2 Adults',
        checkIn: `2026-12-${String((i % 20) + 3).padStart(2, '0')}`,
        checkOut: `2026-12-${String((i % 20) + 7).padStart(2, '0')}`,
        city: cities[i % cities.length],
        assignedStaff: names[(i + 2) % names.length],
        bookingDate: '2026-11-15',
        createdDate: '2026-11-22',
      }));
      await this.refundRecRepo.save(this.refundRecRepo.create(seedRefunds as any));
    }
    if (await this.queryRecRepo.count() === 0) {
      const hotels = ['Taj Palace Delhi', 'Oberoi Mumbai', 'Leela Bangalore', 'ITC Grand Kolkata', 'Marriott Goa', 'Hyatt Jaipur'];
      const cities = ['New Delhi', 'Mumbai', 'Bengaluru', 'Kolkata', 'Goa', 'Jaipur'];
      const names = ['Rahul Sharma', 'Priya Patel', 'Amit Singh', 'Sneha Reddy', 'Vikram Joshi'];
      const queryStatuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
      const queryTypes = ['Price Inquiry', 'Availability Check', 'Room Upgrade Request', 'Special Request'];
      const seedQueries: Partial<HotelQueryRecord>[] = Array.from({ length: 20 }, (_, i) => ({
        queryId: `HQ-${String(i + 1).padStart(4, '0')}`,
        guestName: names[i % names.length],
        guestEmail: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
        guestPhone: `+91 98110 000${String(i).padStart(2, '0')}`,
        queryType: queryTypes[i % queryTypes.length],
        queryStatus: queryStatuses[i % queryStatuses.length],
        hotel: hotels[i % hotels.length],
        city: cities[i % cities.length],
        checkIn: `2026-12-${String((i % 20) + 1).padStart(2, '0')}`,
        checkOut: `2026-12-${String((i % 20) + 5).padStart(2, '0')}`,
        pax: '2 Adults',
        message: 'Looking for special package or rates for these dates.',
        response: 'Thank you for reaching out. We will get back to you with options.',
        assignedStaff: names[(i + 3) % names.length],
        source: 'Website',
        createdDate: '2026-11-20',
        updatedDate: '2026-11-22',
      }));
      await this.queryRecRepo.save(this.queryRecRepo.create(seedQueries as any));
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
    return this.amendRepo.save({ ...existing, ...dto } as any);
  }

  async approveAmendment(id: string): Promise<HotelAmendment> {
    return this.updateAmendment(id, { amendmentStatus: 'Approved' });
  }

  async rejectAmendment(id: string): Promise<HotelAmendment> {
    return this.updateAmendment(id, { amendmentStatus: 'Rejected' });
  }

  // ─── Booking Records ────────────────────────────────────────────────────────
  async findAllBookingRecords(page = 1, limit = 50): Promise<PaginatedResponse<HotelBookingRecord>> {
    return paginate<HotelBookingRecord>(this.bookingRecRepo, page, limit, { order: { id: 'ASC' } });
  }
  async findBookingRecordById(id: number | string): Promise<HotelBookingRecord> {
    const b = await this.bookingRecRepo.findOneBy({ id: Number(id) });
    if (!b) throw new NotFoundException(`Booking record ${id} not found`);
    return b;
  }
  async updateBookingRecord(id: number | string, dto: Partial<HotelBookingRecord>): Promise<HotelBookingRecord> {
    const b = await this.findBookingRecordById(id);
    return this.bookingRecRepo.save({ ...b, ...dto } as any);
  }
  async bulkStatusBookingRecords(dto: BulkStatusDto): Promise<HotelBookingRecord[]> {
    const numIds = dto.ids.map(Number);
    await this.bookingRecRepo.update({ id: In(numIds) }, { status: dto.status });
    return this.bookingRecRepo.find({ where: { id: In(numIds) } });
  }
  async bulkRemoveBookingRecords(ids: (number | string)[]): Promise<void> {
    await this.bookingRecRepo.delete({ id: In(ids.map(Number)) });
  }

  // ─── Amendment Records ──────────────────────────────────────────────────────
  async findAllAmendmentRecords(page = 1, limit = 50): Promise<PaginatedResponse<HotelAmendmentRecord>> {
    return paginate<HotelAmendmentRecord>(this.amendRecRepo, page, limit, { order: { id: 'ASC' } });
  }
  async findAmendmentRecordById(id: number | string): Promise<HotelAmendmentRecord> {
    const a = await this.amendRecRepo.findOneBy({ id: Number(id) });
    if (!a) throw new NotFoundException(`Amendment record ${id} not found`);
    return a;
  }
  async updateAmendmentRecord(id: number | string, dto: Partial<HotelAmendmentRecord>): Promise<HotelAmendmentRecord> {
    const a = await this.findAmendmentRecordById(id);
    return this.amendRecRepo.save({ ...a, ...dto } as any);
  }
  async bulkStatusAmendmentRecords(dto: BulkStatusDto): Promise<HotelAmendmentRecord[]> {
    const numIds = dto.ids.map(Number);
    await this.amendRecRepo.update({ id: In(numIds) }, { amendmentStatus: dto.status });
    return this.amendRecRepo.find({ where: { id: In(numIds) } });
  }
  async bulkRemoveAmendmentRecords(ids: (number | string)[]): Promise<void> {
    await this.amendRecRepo.delete({ id: In(ids.map(Number)) });
  }

  // ─── Refund Records ─────────────────────────────────────────────────────────
  async findAllRefundRecords(page = 1, limit = 50): Promise<PaginatedResponse<HotelRefundRecord>> {
    return paginate<HotelRefundRecord>(this.refundRecRepo, page, limit, { order: { id: 'ASC' } });
  }
  async findRefundRecordById(id: number | string): Promise<HotelRefundRecord> {
    const r = await this.refundRecRepo.findOneBy({ id: Number(id) });
    if (!r) throw new NotFoundException(`Refund record ${id} not found`);
    return r;
  }
  async updateRefundRecord(id: number | string, dto: Partial<HotelRefundRecord>): Promise<HotelRefundRecord> {
    const r = await this.findRefundRecordById(id);
    return this.refundRecRepo.save({ ...r, ...dto } as any);
  }
  async bulkStatusRefundRecords(dto: BulkStatusDto): Promise<HotelRefundRecord[]> {
    const numIds = dto.ids.map(Number);
    await this.refundRecRepo.update({ id: In(numIds) }, { refundStatus: dto.status });
    return this.refundRecRepo.find({ where: { id: In(numIds) } });
  }
  async bulkRemoveRefundRecords(ids: (number | string)[]): Promise<void> {
    await this.refundRecRepo.delete({ id: In(ids.map(Number)) });
  }

  // ─── Query Records ──────────────────────────────────────────────────────────
  async findAllHotelQueryRecords(page = 1, limit = 50): Promise<PaginatedResponse<HotelQueryRecord>> {
    return paginate<HotelQueryRecord>(this.queryRecRepo, page, limit, { order: { id: 'ASC' } });
  }
  async findHotelQueryRecordById(id: number | string): Promise<HotelQueryRecord> {
    const q = await this.queryRecRepo.findOneBy({ id: Number(id) });
    if (!q) throw new NotFoundException(`Query record ${id} not found`);
    return q;
  }
  async createHotelQueryRecord(dto: Partial<HotelQueryRecord>): Promise<HotelQueryRecord> {
    const count = await this.queryRecRepo.count();
    const queryId = `HQ-${String(count + 1).padStart(4, '0')}`;
    const entity = this.queryRecRepo.create({ ...dto, queryId } as any) as unknown as HotelQueryRecord;
    return this.queryRecRepo.save(entity);
  }
  async updateHotelQueryRecord(id: number | string, dto: Partial<HotelQueryRecord>): Promise<HotelQueryRecord> {
    const q = await this.findHotelQueryRecordById(id);
    return this.queryRecRepo.save({ ...q, ...dto, updatedDate: new Date().toISOString().split('T')[0] } as any);
  }
  async bulkStatusHotelQueryRecords(dto: BulkStatusDto): Promise<HotelQueryRecord[]> {
    const numIds = dto.ids.map(Number);
    await this.queryRecRepo.update({ id: In(numIds) }, { queryStatus: dto.status });
    return this.queryRecRepo.find({ where: { id: In(numIds) } });
  }
  async bulkRemoveHotelQueryRecords(ids: (number | string)[]): Promise<void> {
    await this.queryRecRepo.delete({ id: In(ids.map(Number)) });
  }
  async removeHotelQueryRecord(id: number | string): Promise<void> {
    await this.findHotelQueryRecordById(id);
    await this.queryRecRepo.delete(Number(id));
  }
}

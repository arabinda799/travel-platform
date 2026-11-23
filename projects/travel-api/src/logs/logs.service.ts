import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailLog, SmsLog, LoginLog, CouponLog } from './entities/log.entity';

@Injectable()
export class LogsService implements OnModuleInit {
  constructor(
    @InjectRepository(EmailLog) private readonly emailRepo: Repository<EmailLog>,
    @InjectRepository(SmsLog) private readonly smsRepo: Repository<SmsLog>,
    @InjectRepository(LoginLog) private readonly loginRepo: Repository<LoginLog>,
    @InjectRepository(CouponLog) private readonly couponRepo: Repository<CouponLog>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.emailRepo.count() === 0) {
      await this.emailRepo.save([
        this.emailRepo.create({ to: 'priya.sharma@gmail.com', subject: 'Booking Confirmed – BK-2026-90432', template: 'booking_confirmation', status: 'Sent', triggeredBy: 'Booking Confirmed' }),
        this.emailRepo.create({ to: 'rajesh.mehta@outlook.com', subject: 'Your Password Reset Request', template: 'password_reset', status: 'Sent', triggeredBy: 'Password Reset' }),
        this.emailRepo.create({ to: 'john.doe@voyageplus.com', subject: 'Refund Processed – ₹12,500', template: 'refund_notification', status: 'Failed', triggeredBy: 'Refund Processed', errorMessage: 'SMTP connection timeout after 30s.' }),
        this.emailRepo.create({ to: 'sales@gosling.bangeshop.com', subject: 'Booking Confirmed – BK-2026-87654', template: 'booking_confirmation', status: 'Bounced', triggeredBy: 'Booking Confirmed', errorMessage: '550 5.1.1 The email account does not exist.' }),
      ]);
    }
    if (await this.smsRepo.count() === 0) {
      await this.smsRepo.save([
        this.smsRepo.create({ to: '+919811000001', message: 'Your OTP is 456789. Valid for 5 minutes.', template: 'otp', status: 'Sent', triggeredBy: 'Login OTP' }),
        this.smsRepo.create({ to: '+919811000002', message: 'Booking BK-2026-90432 confirmed.', template: 'booking_confirmation', status: 'Sent', triggeredBy: 'Booking Confirmed' }),
        this.smsRepo.create({ to: '+919811000003', message: 'Your payment of ₹12,500 is pending.', template: 'payment_reminder', status: 'Failed', triggeredBy: 'Payment Reminder', errorMessage: 'Invalid phone number format' }),
      ]);
    }
    if (await this.loginRepo.count() === 0) {
      await this.loginRepo.save([
        this.loginRepo.create({ userName: 'Priya Sharma', email: 'priya.sharma@gmail.com', role: 'B2C User', ipAddress: '103.21.58.12', device: 'Desktop', browser: 'Chrome 120', status: 'Success' }),
        this.loginRepo.create({ userName: 'Rahul Verma', email: 'rahul@easyfly.travel', role: 'Tenant Admin', ipAddress: '117.96.47.33', device: 'Mobile', browser: 'Safari 17', status: 'Success' }),
        this.loginRepo.create({ userName: 'Unknown', email: 'hacker@spam.io', role: 'Unknown', ipAddress: '192.168.1.100', device: 'Desktop', browser: 'Firefox 115', status: 'Blocked' }),
      ]);
    }
    if (await this.couponRepo.count() === 0) {
      await this.couponRepo.save([
        this.couponRepo.create({ couponCode: 'HOTEL10', usedBy: 'Priya Sharma', email: 'priya.sharma@gmail.com', bookingId: 'BK-2026-90432', discountAmount: 1200, discountType: 'Percentage', status: 'Applied' }),
        this.couponRepo.create({ couponCode: 'FLAT500', usedBy: 'Rahul Verma', email: 'rahul@example.com', bookingId: 'BK-2026-88201', discountAmount: 500, discountType: 'Flat', status: 'Applied' }),
        this.couponRepo.create({ couponCode: 'EXPIRED50', usedBy: 'John Doe', email: 'john@voyageplus.com', bookingId: 'BK-2026-85000', discountAmount: 0, discountType: 'Percentage', status: 'Expired' }),
      ]);
    }
  }

  // ─── Email Logs ──────────────────────────────────────────────────────────

  async findAllEmailLogs(): Promise<EmailLog[]> { return this.emailRepo.find({ order: { sentAt: 'DESC' } }); }
  async findOneEmailLog(id: string): Promise<EmailLog> {
    const l = await this.emailRepo.findOneBy({ id });
    if (!l) throw new NotFoundException(`Email log ${id} not found`);
    return l;
  }

  // ─── SMS Logs ─────────────────────────────────────────────────────────────

  async findAllSmsLogs(): Promise<SmsLog[]> { return this.smsRepo.find({ order: { sentAt: 'DESC' } }); }
  async findOneSmsLog(id: string): Promise<SmsLog> {
    const l = await this.smsRepo.findOneBy({ id });
    if (!l) throw new NotFoundException(`SMS log ${id} not found`);
    return l;
  }

  // ─── Login Logs ───────────────────────────────────────────────────────────

  async findAllLoginLogs(): Promise<LoginLog[]> { return this.loginRepo.find({ order: { createdAt: 'DESC' } }); }

  // ─── Coupon Logs ──────────────────────────────────────────────────────────

  async findAllCouponLogs(): Promise<CouponLog[]> { return this.couponRepo.find({ order: { usedAt: 'DESC' } }); }
}

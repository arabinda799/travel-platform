import { Controller, Get, Post, Patch, Delete, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { LogsService } from './logs.service';
import { BulkDeleteDto } from './dto/log.dto';

@Controller()
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  // ── Email Logs ─────────────────────────────────────────────────────────────
  @Get('email-logs')
  findAllEmailLogs() { return this.logsService.findAllEmailLogs(); }

  @Patch('email-logs/:id/resend')
  resendEmail(@Param('id') id: string) { return this.logsService.resendEmail(id); }

  @Delete('email-logs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeEmailLog(@Param('id') id: string) { return this.logsService.removeEmailLog(id); }

  @Post('email-logs/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemoveEmailLogs(@Body() dto: BulkDeleteDto) { return this.logsService.bulkRemoveEmailLogs(dto.ids); }

  // ── SMS Logs ───────────────────────────────────────────────────────────────
  @Get('sms-logs')
  findAllSmsLogs() { return this.logsService.findAllSmsLogs(); }

  @Patch('sms-logs/:id/resend')
  resendSms(@Param('id') id: string) { return this.logsService.resendSms(id); }

  @Delete('sms-logs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeSmsLog(@Param('id') id: string) { return this.logsService.removeSmsLog(id); }

  @Post('sms-logs/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemoveSmsLogs(@Body() dto: BulkDeleteDto) { return this.logsService.bulkRemoveSmsLogs(dto.ids); }

  // ── Login Logs ─────────────────────────────────────────────────────────────
  @Get('login-logs')
  findAllLoginLogs() { return this.logsService.findAllLoginLogs(); }

  @Delete('login-logs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeLoginLog(@Param('id') id: string) { return this.logsService.removeLoginLog(id); }

  @Post('login-logs/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemoveLoginLogs(@Body() dto: BulkDeleteDto) { return this.logsService.bulkRemoveLoginLogs(dto.ids); }

  // ── Coupon Logs ────────────────────────────────────────────────────────────
  @Get('coupon-logs')
  findAllCouponLogs() { return this.logsService.findAllCouponLogs(); }

  @Delete('coupon-logs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCouponLog(@Param('id') id: string) { return this.logsService.removeCouponLog(id); }

  @Post('coupon-logs/bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemoveCouponLogs(@Body() dto: BulkDeleteDto) { return this.logsService.bulkRemoveCouponLogs(dto.ids); }
}

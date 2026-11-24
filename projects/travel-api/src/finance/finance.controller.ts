import { Controller, Get, Post, Body, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { FinanceService } from './finance.service';

@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('wallet')
  getWallet(@Query('tenantId') tenantId?: string) {
    return this.financeService.getWallet(tenantId);
  }

  @Post('wallet/topup')
  topupWallet(@Body() body: { amount: number; paymentMode?: string; reference?: string; remarks?: string }, @Query('tenantId') tenantId?: string) {
    return this.financeService.topupWallet(tenantId, body);
  }

  @Get('transactions')
  getTransactions(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('tenantId') tenantId?: string,
  ) {
    return this.financeService.getTransactions(page, limit, tenantId);
  }
}

import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, Query, HttpCode, HttpStatus, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { PaymentGatewaysService } from './payment-gateways.service';
import {
  BulkStatusDto, CreateGatewayDto, SaveFeeRuleDto, UpdateGatewayDto,
} from './dto/payment-gateway.dto';

@Controller()
export class PaymentGatewaysController {
  constructor(private readonly service: PaymentGatewaysService) {}

  // ─── Gateways ───────────────────────────────────────────────────────────────

  @Get('payment-gateways')
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAllGateways(page, limit); }

  @Post('payment-gateways')
  create(@Body() dto: CreateGatewayDto) { return this.service.createGateway(dto); }

  @Patch('payment-gateways/bulk-status')
  bulkStatus(@Body() dto: BulkStatusDto) { return this.service.bulkUpdateStatus(dto); }

  @Patch('payment-gateways/:id')
  update(@Param('id') id: string, @Body() dto: UpdateGatewayDto) {
    return this.service.updateGateway(id, dto);
  }

  @Delete('payment-gateways/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { this.service.removeGateway(id); }

  // ─── Convenience Fee Rules ──────────────────────────────────────────────────

  @Get('convenience-fees')
  findFeeRules(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('gatewayId') gatewayId?: string,
  ) {
    return gatewayId
      ? this.service.findFeeRulesByGateway(gatewayId)
      : this.service.findAllFeeRules(page, limit);
  }

  @Post('convenience-fees')
  saveFeeRule(@Body() dto: SaveFeeRuleDto) { return this.service.saveFeeRule(dto); }

  @Delete('convenience-fees/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteFeeRule(@Param('id') id: string) { this.service.deleteFeeRule(id); }
}

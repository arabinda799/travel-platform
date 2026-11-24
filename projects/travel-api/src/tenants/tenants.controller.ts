import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, HttpCode, HttpStatus, Query, DefaultValuePipe, ParseIntPipe,
} from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { TenantBranding, TenantSmtp } from './entities/tenant.entity';

@Controller('tenants')
export class TenantsController {
  constructor(private readonly service: TenantsService) {}

  @Get()
  findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) { return this.service.findAll(page, limit); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  create(@Body() dto: CreateTenantDto) { return this.service.create(dto); }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateTenantDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/branding')
  updateBranding(@Param('id') id: string, @Body() branding: TenantBranding) {
    return this.service.updateBranding(id, branding);
  }

  @Patch(':id/smtp')
  updateSmtp(@Param('id') id: string, @Body() smtp: TenantSmtp) {
    return this.service.updateSmtp(id, smtp);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) { this.service.remove(id); }

  @Post('bulk-delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  bulkRemove(@Body() body: { ids: string[] }) {
    return this.service.bulkRemove(body.ids);
  }
}

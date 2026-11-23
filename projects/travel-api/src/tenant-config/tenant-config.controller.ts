import { Controller, Get, Query, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantCompany } from '../tenants/entities/tenant.entity';
import { Public } from '../auth/decorators/public.decorator';

@Controller('tenant-config')
export class TenantConfigController {
  constructor(
    @InjectRepository(TenantCompany) private readonly repo: Repository<TenantCompany>,
  ) {}

  @Public()
  @Get()
  async getConfig(@Query('domain') domain?: string, @Query('code') code?: string) {
    let tenant: TenantCompany | null = null;

    if (domain) {
      tenant = await this.repo.findOneBy({ domain });
    } else if (code) {
      tenant = await this.repo.findOneBy({ companyCode: code.toUpperCase() });
    }

    if (!tenant) throw new NotFoundException('Tenant not found');

    return {
      id: tenant.id,
      companyName: tenant.companyName,
      domain: tenant.domain,
      branding: tenant.branding,
    };
  }
}

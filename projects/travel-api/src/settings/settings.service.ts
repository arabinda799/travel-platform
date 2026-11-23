import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SettingsEntity, CompanySettings, DEFAULT_SETTINGS } from './settings.entity';

const SETTINGS_ID = 'global';

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(@InjectRepository(SettingsEntity) private readonly repo: Repository<SettingsEntity>) {}

  async onModuleInit(): Promise<void> {
    const existing = await this.repo.findOneBy({ id: SETTINGS_ID });
    if (!existing) {
      await this.repo.save(this.repo.create({ id: SETTINGS_ID, ...DEFAULT_SETTINGS }));
    }
  }

  async get(): Promise<CompanySettings> {
    const entity = await this.repo.findOneBy({ id: SETTINGS_ID });
    const { id: _id, updatedAt: _u, ...settings } = entity!;
    return settings as CompanySettings;
  }

  async update(payload: Partial<CompanySettings>): Promise<CompanySettings> {
    const entity = await this.repo.findOneBy({ id: SETTINGS_ID });
    const merged = this.repo.merge(entity!, payload as Partial<SettingsEntity>);
    await this.repo.save(merged);
    const { id: _id, updatedAt: _u, ...settings } = merged;
    return settings as CompanySettings;
  }
}

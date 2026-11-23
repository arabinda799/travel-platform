import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentController } from './content.controller';
import { ContentService } from './content.service';
import {
  BlogCategory, BlogPost, Slider, NewsletterSubscriber, ContactQuery, PageItem, MenuLabel, MenuPageEntry,
} from './entities/content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlogCategory, BlogPost, Slider, NewsletterSubscriber, ContactQuery, PageItem, MenuLabel, MenuPageEntry])],
  controllers: [ContentController],
  providers: [ContentService],
})
export class ContentModule {}

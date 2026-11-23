import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('blog_categories')
export class BlogCategory {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ unique: true }) slug: string;
  @Column({ default: '' }) image: string;
  @Column({ default: '' }) description: string;
  @Column({ default: 'Active' }) status: 'Active' | 'Inactive';
  @Column({ default: 'index, follow' }) metaRobots: string;
  @Column({ default: '' }) metaTitle: string;
  @Column({ default: '' }) metaKeyword: string;
  @Column({ default: '' }) metaDescription: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() modifiedAt: Date;
}

@Entity('blog_posts')
export class BlogPost {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ unique: true }) slug: string;
  @Column({ nullable: true, type: 'text' }) categoryId: string | null;
  @Column({ default: '' }) categoryName: string;
  @Column({ default: '' }) image: string;
  @Column({ type: 'text', default: '' }) description: string;
  @Column({ default: 'Draft' }) status: 'Active' | 'Inactive';
  @Column({ default: '' }) postedBy: string;
  @Column({ default: 'index, follow' }) metaRobots: string;
  @Column({ default: '' }) metaTitle: string;
  @Column({ default: '' }) metaKeyword: string;
  @Column({ default: '' }) metaDescription: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() modifiedAt: Date;
}

export type SliderPlatform = 'ALL' | 'WEB' | 'ANDROID' | 'IOS';
export interface SliderBadge { icon: string; text: string; }

@Entity('sliders')
export class Slider {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: 'HOTEL' }) serviceType: 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
  @Column({ default: 'B2C' }) userType: 'B2C' | 'B2B';
  @Column({ default: 'ALL' }) platform: SliderPlatform;
  @Column({ default: '' }) mainTitle: string;
  @Column({ default: '' }) smallSubtitle: string;
  @Column({ default: '' }) rightItalicText: string;
  @Column({ type: 'simple-json', default: '[]' }) badges: SliderBadge[];
  @Column({ default: '' }) imageUrl: string;
  @Column({ default: 1 }) sortOrder: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() modifiedAt: Date;
}

@Entity('newsletter_subscribers')
export class NewsletterSubscriber {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ default: '' }) name: string;
  @Column({ unique: true }) email: string;
  @Column({ default: 'Subscribed' }) status: 'Subscribed' | 'Unsubscribed';
  @CreateDateColumn() createdDate: Date;
}

@Entity('contact_queries')
export class ContactQuery {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() email: string;
  @Column({ default: '' }) phone: string;
  @Column({ default: '' }) queryType: string;
  @Column({ default: '' }) subject: string;
  @Column({ type: 'text', default: '' }) message: string;
  @Column({ default: 'New' }) status: 'New' | 'In Progress' | 'Resolved';
  @CreateDateColumn() createdDate: Date;
}

@Entity('pages')
export class PageItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title: string;
  @Column({ unique: true }) slug: string;
  @Column({ default: 'default' }) template: string;
  @Column({ default: 'Draft' }) status: 'Published' | 'Draft' | 'Archived';
  @Column({ default: '' }) author: string;
  @Column({ type: 'text', default: '' }) content: string;
  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}

@Entity('menu_labels')
export class MenuLabel {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
}

@Entity('menu_page_entries')
export class MenuPageEntry {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() labelId: string;
  @Column() pageId: string;
  @Column({ default: '' }) title: string;
  @Column({ default: '' }) slug: string;
  @Column({ default: 0 }) order: number;
}

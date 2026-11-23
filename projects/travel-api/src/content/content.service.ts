import { ConflictException, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  BlogCategory, BlogPost, Slider, NewsletterSubscriber, ContactQuery, PageItem, MenuLabel, MenuPageEntry,
} from './entities/content.entity';
import {
  CreateBlogCategoryDto, UpdateBlogCategoryDto,
  CreateBlogPostDto, UpdateBlogPostDto,
  CreateSliderDto, UpdateSliderDto,
  CreateSubscriberDto, UpdateSubscriberDto,
  UpdateContactQueryDto,
  CreatePageDto, UpdatePageDto,
  CreateMenuLabelDto, UpdateMenuLabelDto,
  SaveMenuItemDto, BulkDeleteDto,
} from './dto/content.dto';

@Injectable()
export class ContentService implements OnModuleInit {
  constructor(
    @InjectRepository(BlogCategory) private readonly catRepo: Repository<BlogCategory>,
    @InjectRepository(BlogPost) private readonly postRepo: Repository<BlogPost>,
    @InjectRepository(Slider) private readonly sliderRepo: Repository<Slider>,
    @InjectRepository(NewsletterSubscriber) private readonly subRepo: Repository<NewsletterSubscriber>,
    @InjectRepository(ContactQuery) private readonly queryRepo: Repository<ContactQuery>,
    @InjectRepository(PageItem) private readonly pageRepo: Repository<PageItem>,
    @InjectRepository(MenuLabel) private readonly labelRepo: Repository<MenuLabel>,
    @InjectRepository(MenuPageEntry) private readonly menuEntryRepo: Repository<MenuPageEntry>,
  ) {}

  async onModuleInit(): Promise<void> {
    if (await this.catRepo.count() === 0) {
      await this.catRepo.save([
        this.catRepo.create({ name: 'Travel Tips', slug: 'travel-tips', status: 'Active' }),
        this.catRepo.create({ name: 'Destinations', slug: 'destinations', status: 'Active' }),
        this.catRepo.create({ name: 'Hotel Reviews', slug: 'hotel-reviews', status: 'Active' }),
      ]);
    }
    if (await this.sliderRepo.count() === 0) {
      await this.sliderRepo.save([
        this.sliderRepo.create({ serviceType: 'HOTEL', userType: 'B2C', platform: 'WEB', mainTitle: 'Book Hotels at Best Prices', smallSubtitle: 'Exclusive deals on 1M+ hotels', badges: [{ icon: 'verified', text: 'Trusted' }], sortOrder: 1, isActive: true }),
        this.sliderRepo.create({ serviceType: 'FLIGHT', userType: 'B2B', platform: 'ALL', mainTitle: 'Fly Anywhere', smallSubtitle: 'Business travel made easy', badges: [], sortOrder: 2, isActive: true }),
      ]);
    }
    if (await this.queryRepo.count() === 0) {
      await this.queryRepo.save([
        this.queryRepo.create({ name: 'Priya Sharma', email: 'priya.sharma@gmail.com', phone: '9811000001', queryType: 'Booking Issue', subject: 'Unable to process payment', message: 'I am unable to complete my booking due to payment failure.', status: 'New' }),
        this.queryRepo.create({ name: 'Rahul Verma', email: 'rahul@example.com', phone: '9811000002', queryType: 'Refund', subject: 'Refund not received', message: 'My refund for booking #12345 has not been received yet.', status: 'In Progress' }),
      ]);
    }
  }

  // ─── Blog Categories ──────────────────────────────────────────────────────

  async findAllCategories(): Promise<BlogCategory[]> { return this.catRepo.find({ order: { createdAt: 'ASC' } }); }
  async findOneCategory(id: string): Promise<BlogCategory> {
    const c = await this.catRepo.findOneBy({ id });
    if (!c) throw new NotFoundException(`Category ${id} not found`);
    return c;
  }
  async createCategory(dto: CreateBlogCategoryDto): Promise<BlogCategory> {
    const taken = await this.catRepo.findOneBy({ slug: dto.slug });
    if (taken) throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.catRepo.save(this.catRepo.create(dto));
  }
  async updateCategory(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategory> {
    const c = await this.findOneCategory(id);
    return this.catRepo.save({ ...c, ...dto });
  }
  async removeCategory(id: string): Promise<void> { await this.findOneCategory(id); await this.catRepo.delete(id); }
  async bulkDeleteCategories(dto: BulkDeleteDto): Promise<void> { await this.catRepo.delete({ id: In(dto.ids) }); }

  // ─── Blog Posts ───────────────────────────────────────────────────────────

  async findAllPosts(): Promise<BlogPost[]> { return this.postRepo.find({ order: { createdAt: 'DESC' } }); }
  async findOnePost(id: string): Promise<BlogPost> {
    const p = await this.postRepo.findOneBy({ id });
    if (!p) throw new NotFoundException(`Post ${id} not found`);
    return p;
  }
  async createPost(dto: CreateBlogPostDto): Promise<BlogPost> {
    const taken = await this.postRepo.findOneBy({ slug: dto.slug });
    if (taken) throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.postRepo.save(this.postRepo.create(dto));
  }
  async updatePost(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const p = await this.findOnePost(id);
    return this.postRepo.save({ ...p, ...dto });
  }
  async removePost(id: string): Promise<void> { await this.findOnePost(id); await this.postRepo.delete(id); }
  async bulkDeletePosts(dto: BulkDeleteDto): Promise<void> { await this.postRepo.delete({ id: In(dto.ids) }); }

  // ─── Sliders ──────────────────────────────────────────────────────────────

  async findAllSliders(): Promise<Slider[]> { return this.sliderRepo.find({ order: { sortOrder: 'ASC' } }); }
  async findOneSlider(id: string): Promise<Slider> {
    const s = await this.sliderRepo.findOneBy({ id });
    if (!s) throw new NotFoundException(`Slider ${id} not found`);
    return s;
  }
  async createSlider(dto: CreateSliderDto): Promise<Slider> { return this.sliderRepo.save(this.sliderRepo.create(dto)); }
  async updateSlider(id: string, dto: UpdateSliderDto): Promise<Slider> {
    const s = await this.findOneSlider(id);
    return this.sliderRepo.save({ ...s, ...dto });
  }
  async removeSlider(id: string): Promise<void> { await this.findOneSlider(id); await this.sliderRepo.delete(id); }
  async bulkDeleteSliders(dto: BulkDeleteDto): Promise<void> { await this.sliderRepo.delete({ id: In(dto.ids) }); }

  // ─── Newsletter ───────────────────────────────────────────────────────────

  async findAllSubscribers(): Promise<NewsletterSubscriber[]> { return this.subRepo.find({ order: { createdDate: 'DESC' } }); }
  async createSubscriber(dto: CreateSubscriberDto): Promise<NewsletterSubscriber> {
    const taken = await this.subRepo.findOneBy({ email: dto.email.toLowerCase() });
    if (taken) throw new ConflictException(`Email '${dto.email}' already subscribed`);
    return this.subRepo.save(this.subRepo.create({ ...dto, email: dto.email.toLowerCase() }));
  }
  async updateSubscriber(id: string, dto: UpdateSubscriberDto): Promise<NewsletterSubscriber> {
    const s = await this.subRepo.findOneBy({ id });
    if (!s) throw new NotFoundException(`Subscriber ${id} not found`);
    return this.subRepo.save({ ...s, ...dto });
  }
  async bulkDeleteSubscribers(dto: BulkDeleteDto): Promise<void> { await this.subRepo.delete({ id: In(dto.ids) }); }

  // ─── Contact Queries ──────────────────────────────────────────────────────

  async findAllQueries(): Promise<ContactQuery[]> { return this.queryRepo.find({ order: { createdDate: 'DESC' } }); }
  async updateQuery(id: string, dto: UpdateContactQueryDto): Promise<ContactQuery> {
    const q = await this.queryRepo.findOneBy({ id });
    if (!q) throw new NotFoundException(`Query ${id} not found`);
    return this.queryRepo.save({ ...q, ...dto });
  }

  // ─── Pages ────────────────────────────────────────────────────────────────

  async findAllPages(): Promise<PageItem[]> { return this.pageRepo.find({ order: { createdAt: 'ASC' } }); }
  async findOnePage(id: string): Promise<PageItem> {
    const p = await this.pageRepo.findOneBy({ id });
    if (!p) throw new NotFoundException(`Page ${id} not found`);
    return p;
  }
  async createPage(dto: CreatePageDto): Promise<PageItem> {
    const taken = await this.pageRepo.findOneBy({ slug: dto.slug });
    if (taken) throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.pageRepo.save(this.pageRepo.create(dto));
  }
  async updatePage(id: string, dto: UpdatePageDto): Promise<PageItem> {
    const p = await this.findOnePage(id);
    return this.pageRepo.save({ ...p, ...dto });
  }
  async removePage(id: string): Promise<void> { await this.findOnePage(id); await this.pageRepo.delete(id); }
  async bulkDeletePages(dto: BulkDeleteDto): Promise<void> { await this.pageRepo.delete({ id: In(dto.ids) }); }

  // ─── Menu ─────────────────────────────────────────────────────────────────

  async findAllMenuLabels(): Promise<MenuLabel[]> { return this.labelRepo.find(); }
  async createMenuLabel(dto: CreateMenuLabelDto): Promise<MenuLabel> { return this.labelRepo.save(this.labelRepo.create(dto)); }
  async updateMenuLabel(id: string, dto: UpdateMenuLabelDto): Promise<MenuLabel> {
    const l = await this.labelRepo.findOneBy({ id });
    if (!l) throw new NotFoundException(`Menu label ${id} not found`);
    return this.labelRepo.save({ ...l, ...dto });
  }
  async removeMenuLabel(id: string): Promise<void> {
    const l = await this.labelRepo.findOneBy({ id });
    if (!l) throw new NotFoundException(`Menu label ${id} not found`);
    await this.labelRepo.delete(id);
    await this.menuEntryRepo.delete({ labelId: id });
  }

  async findMenuItems(labelId: string): Promise<MenuPageEntry[]> {
    return this.menuEntryRepo.find({ where: { labelId }, order: { order: 'ASC' } });
  }
  async saveMenuItem(dto: SaveMenuItemDto): Promise<MenuPageEntry> {
    if (dto.id) {
      const existing = await this.menuEntryRepo.findOneBy({ id: dto.id });
      if (existing) return this.menuEntryRepo.save({ ...existing, ...dto });
    }
    return this.menuEntryRepo.save(this.menuEntryRepo.create(dto));
  }
  async removeMenuItem(id: string): Promise<void> {
    const entry = await this.menuEntryRepo.findOneBy({ id });
    if (!entry) throw new NotFoundException(`Menu item ${id} not found`);
    await this.menuEntryRepo.delete(id);
  }
}

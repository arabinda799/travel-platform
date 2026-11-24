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
    if (await this.labelRepo.count() === 0) {
      const lbl1 = await this.labelRepo.save(this.labelRepo.create({ name: 'Header Navigation' }));
      const lbl2 = await this.labelRepo.save(this.labelRepo.create({ name: 'Footer Links' }));
      const lbl3 = await this.labelRepo.save(this.labelRepo.create({ name: 'Support & Help Menu' }));
      await this.menuEntryRepo.save([
        this.menuEntryRepo.create({ labelId: lbl1.id, pageId: 'page-1', title: 'About Us', slug: 'about-us', order: 1 }),
        this.menuEntryRepo.create({ labelId: lbl1.id, pageId: 'page-5', title: 'Help Center & FAQs', slug: 'faq', order: 2 }),
        this.menuEntryRepo.create({ labelId: lbl2.id, pageId: 'page-1', title: 'About Us', slug: 'about-us', order: 1 }),
        this.menuEntryRepo.create({ labelId: lbl2.id, pageId: 'page-2', title: 'Terms & Conditions', slug: 'terms-and-conditions', order: 2 }),
        this.menuEntryRepo.create({ labelId: lbl2.id, pageId: 'page-3', title: 'Privacy Policy', slug: 'privacy-policy', order: 3 }),
        this.menuEntryRepo.create({ labelId: lbl2.id, pageId: 'page-4', title: 'Cancellation Policy', slug: 'cancellation-policy', order: 4 }),
        this.menuEntryRepo.create({ labelId: lbl3.id, pageId: 'page-5', title: 'Help Center & FAQs', slug: 'faq', order: 1 }),
        this.menuEntryRepo.create({ labelId: lbl3.id, pageId: 'page-4', title: 'Cancellation Policy', slug: 'cancellation-policy', order: 2 }),
      ]);
    }
  }

  // ─── Blog Categories ──────────────────────────────────────────────────────

  async findAllCategories(): Promise<BlogCategory[]> { return this.catRepo.find({ order: { createdAt: 'ASC' } }); }
  async findAllBlogCategories(): Promise<BlogCategory[]> { return this.findAllCategories(); }
  async findOneCategory(id: string): Promise<BlogCategory> {
    const c = await this.catRepo.findOneBy({ id });
    if (!c) throw new NotFoundException(`Category ${id} not found`);
    return c;
  }
  async findOneBlogCategory(id: string): Promise<BlogCategory> { return this.findOneCategory(id); }
  async createCategory(dto: CreateBlogCategoryDto): Promise<BlogCategory> {
    const taken = await this.catRepo.findOneBy({ slug: dto.slug });
    if (taken) throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.catRepo.save(this.catRepo.create(dto));
  }
  async createBlogCategory(dto: CreateBlogCategoryDto): Promise<BlogCategory> { return this.createCategory(dto); }
  async updateCategory(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategory> {
    const c = await this.findOneCategory(id);
    return this.catRepo.save({ ...c, ...dto });
  }
  async updateBlogCategory(id: string, dto: UpdateBlogCategoryDto): Promise<BlogCategory> { return this.updateCategory(id, dto); }
  async removeCategory(id: string): Promise<void> { await this.findOneCategory(id); await this.catRepo.delete(id); }
  async removeBlogCategory(id: string): Promise<void> { return this.removeCategory(id); }
  async bulkDeleteCategories(dto: BulkDeleteDto): Promise<void> { await this.catRepo.delete({ id: In(dto.ids) }); }
  async bulkRemoveBlogCategories(dto: BulkDeleteDto): Promise<void> { return this.bulkDeleteCategories(dto); }

  // ─── Blog Posts ───────────────────────────────────────────────────────────

  async findAllPosts(): Promise<BlogPost[]> { return this.postRepo.find({ order: { createdAt: 'DESC' } }); }
  async findAllBlogPosts(): Promise<BlogPost[]> { return this.findAllPosts(); }
  async findOnePost(id: string): Promise<BlogPost> {
    const p = await this.postRepo.findOneBy({ id });
    if (!p) throw new NotFoundException(`Post ${id} not found`);
    return p;
  }
  async findOneBlogPost(id: string): Promise<BlogPost> { return this.findOnePost(id); }
  async createPost(dto: CreateBlogPostDto): Promise<BlogPost> {
    const taken = await this.postRepo.findOneBy({ slug: dto.slug });
    if (taken) throw new ConflictException(`Slug '${dto.slug}' already exists`);
    return this.postRepo.save(this.postRepo.create(dto));
  }
  async createBlogPost(dto: CreateBlogPostDto): Promise<BlogPost> { return this.createPost(dto); }
  async updatePost(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> {
    const p = await this.findOnePost(id);
    return this.postRepo.save({ ...p, ...dto });
  }
  async updateBlogPost(id: string, dto: UpdateBlogPostDto): Promise<BlogPost> { return this.updatePost(id, dto); }
  async removePost(id: string): Promise<void> { await this.findOnePost(id); await this.postRepo.delete(id); }
  async removeBlogPost(id: string): Promise<void> { return this.removePost(id); }
  async bulkDeletePosts(dto: BulkDeleteDto): Promise<void> { await this.postRepo.delete({ id: In(dto.ids) }); }
  async bulkRemoveBlogPosts(dto: BulkDeleteDto): Promise<void> { return this.bulkDeletePosts(dto); }

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
  async bulkRemoveSliders(dto: BulkDeleteDto): Promise<void> { return this.bulkDeleteSliders(dto); }

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
  async removeSubscriber(id: string): Promise<void> {
    const s = await this.subRepo.findOneBy({ id });
    if (!s) throw new NotFoundException(`Subscriber ${id} not found`);
    await this.subRepo.delete(id);
  }
  async bulkDeleteSubscribers(dto: BulkDeleteDto): Promise<void> { await this.subRepo.delete({ id: In(dto.ids) }); }
  async bulkRemoveSubscribers(dto: BulkDeleteDto): Promise<void> { return this.bulkDeleteSubscribers(dto); }

  // ─── Contact Queries ──────────────────────────────────────────────────────

  async findAllQueries(): Promise<ContactQuery[]> { return this.queryRepo.find({ order: { createdDate: 'DESC' } }); }
  async findAllContactQueries(): Promise<ContactQuery[]> { return this.findAllQueries(); }
  async updateQuery(id: string, dto: UpdateContactQueryDto): Promise<ContactQuery> {
    const q = await this.queryRepo.findOneBy({ id });
    if (!q) throw new NotFoundException(`Query ${id} not found`);
    return this.queryRepo.save({ ...q, ...dto });
  }
  async updateContactQueryStatus(id: string, dto: UpdateContactQueryDto): Promise<ContactQuery> { return this.updateQuery(id, dto); }
  async removeContactQuery(id: string): Promise<void> {
    const q = await this.queryRepo.findOneBy({ id });
    if (!q) throw new NotFoundException(`Query ${id} not found`);
    await this.queryRepo.delete(id);
  }
  async bulkRemoveContactQueries(dto: BulkDeleteDto): Promise<void> {
    await this.queryRepo.delete({ id: In(dto.ids) });
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
  async bulkRemovePages(dto: BulkDeleteDto): Promise<void> { return this.bulkDeletePages(dto); }

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
  async findMenuItemsByLabel(labelId: string): Promise<MenuPageEntry[]> { return this.findMenuItems(labelId); }
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
  async replaceMenuItems(labelId: string, items: { pageId: string; title: string; slug: string; order: number }[]): Promise<MenuPageEntry[]> {
    await this.menuEntryRepo.delete({ labelId });
    if (!items || items.length === 0) return [];
    const entries = items.map((it, idx) =>
      this.menuEntryRepo.create({
        labelId,
        pageId: it.pageId,
        title: it.title,
        slug: it.slug,
        order: it.order ?? idx + 1,
      })
    );
    return this.menuEntryRepo.save(entries);
  }
}

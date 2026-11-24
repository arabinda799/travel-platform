import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator';
import { ContentService } from './content.service';
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

@Controller()
export class ContentController {
  constructor(private readonly service: ContentService) {}

  // ─── Blog Categories ──────────────────────────────────────────────────────

  @Get('blog-categories')
  getBlogCategories() { return this.service.findAllBlogCategories(); }

  @Get('blog-categories/:id')
  getBlogCategory(@Param('id') id: string) { return this.service.findOneBlogCategory(id); }

  @Post('blog-categories')
  createBlogCategory(@Body() dto: CreateBlogCategoryDto) { return this.service.createBlogCategory(dto); }

  @Patch('blog-categories/:id')
  updateBlogCategory(@Param('id') id: string, @Body() dto: UpdateBlogCategoryDto) { return this.service.updateBlogCategory(id, dto); }

  @Delete('blog-categories/:id')
  @HttpCode(204)
  removeBlogCategory(@Param('id') id: string) { this.service.removeBlogCategory(id); }

  @Post('blog-categories/bulk-delete')
  @HttpCode(204)
  bulkDeleteBlogCategories(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveBlogCategories(dto); }

  // ─── Blog Posts ───────────────────────────────────────────────────────────

  @Get('blog-posts')
  getBlogPosts() { return this.service.findAllBlogPosts(); }

  @Get('blog-posts/:id')
  getBlogPost(@Param('id') id: string) { return this.service.findOneBlogPost(id); }

  @Post('blog-posts')
  createBlogPost(@Body() dto: CreateBlogPostDto) { return this.service.createBlogPost(dto); }

  @Patch('blog-posts/:id')
  updateBlogPost(@Param('id') id: string, @Body() dto: UpdateBlogPostDto) { return this.service.updateBlogPost(id, dto); }

  @Delete('blog-posts/:id')
  @HttpCode(204)
  removeBlogPost(@Param('id') id: string) { this.service.removeBlogPost(id); }

  @Post('blog-posts/bulk-delete')
  @HttpCode(204)
  bulkDeleteBlogPosts(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveBlogPosts(dto); }

  // ─── Sliders ──────────────────────────────────────────────────────────────

  @Get('sliders')
  getSliders() { return this.service.findAllSliders(); }

  @Get('sliders/:id')
  getSlider(@Param('id') id: string) { return this.service.findOneSlider(id); }

  @Post('sliders')
  createSlider(@Body() dto: CreateSliderDto) { return this.service.createSlider(dto); }

  @Patch('sliders/:id')
  updateSlider(@Param('id') id: string, @Body() dto: UpdateSliderDto) { return this.service.updateSlider(id, dto); }

  @Delete('sliders/:id')
  @HttpCode(204)
  removeSlider(@Param('id') id: string) { this.service.removeSlider(id); }

  @Post('sliders/bulk-delete')
  @HttpCode(204)
  bulkDeleteSliders(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveSliders(dto); }

  // ─── Newsletter ───────────────────────────────────────────────────────────

  @Get('newsletter')
  getSubscribers() { return this.service.findAllSubscribers(); }

  @Post('newsletter')
  createSubscriber(@Body() dto: CreateSubscriberDto) { return this.service.createSubscriber(dto); }

  @Patch('newsletter/:id')
  updateSubscriber(@Param('id') id: string, @Body() dto: UpdateSubscriberDto) { return this.service.updateSubscriber(id, dto); }

  @Delete('newsletter/:id')
  @HttpCode(204)
  removeSubscriber(@Param('id') id: string) { this.service.removeSubscriber(id); }

  @Post('newsletter/bulk-delete')
  @HttpCode(204)
  bulkDeleteSubscribers(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveSubscribers(dto); }

  // ─── Contact Queries ──────────────────────────────────────────────────────

  @Get('contact-queries')
  getContactQueries() { return this.service.findAllContactQueries(); }

  @Patch('contact-queries/:id/status')
  updateContactQueryStatus(@Param('id') id: string, @Body() dto: UpdateContactQueryDto) {
    return this.service.updateContactQueryStatus(id, dto);
  }

  @Delete('contact-queries/:id')
  @HttpCode(204)
  removeContactQuery(@Param('id') id: string) { this.service.removeContactQuery(id); }

  @Post('contact-queries/bulk-delete')
  @HttpCode(204)
  bulkDeleteContactQueries(@Body() dto: BulkDeleteDto) { this.service.bulkRemoveContactQueries(dto); }

  // ─── Pages ────────────────────────────────────────────────────────────────

  @Get('pages')
  getPages() { return this.service.findAllPages(); }

  @Get('pages/:id')
  getPage(@Param('id') id: string) { return this.service.findOnePage(id); }

  @Post('pages')
  createPage(@Body() dto: CreatePageDto) { return this.service.createPage(dto); }

  @Patch('pages/:id')
  updatePage(@Param('id') id: string, @Body() dto: UpdatePageDto) { return this.service.updatePage(id, dto); }

  @Delete('pages/:id')
  @HttpCode(204)
  removePage(@Param('id') id: string) { this.service.removePage(id); }

  @Post('pages/bulk-delete')
  @HttpCode(204)
  bulkDeletePages(@Body() dto: BulkDeleteDto) { this.service.bulkRemovePages(dto); }

  // ─── Menu Labels ──────────────────────────────────────────────────────────

  @Get('menu-labels')
  getMenuLabels() { return this.service.findAllMenuLabels(); }

  @Post('menu-labels')
  createMenuLabel(@Body() dto: CreateMenuLabelDto) { return this.service.createMenuLabel(dto); }

  @Patch('menu-labels/:id')
  updateMenuLabel(@Param('id') id: string, @Body() dto: UpdateMenuLabelDto) { return this.service.updateMenuLabel(id, dto); }

  @Delete('menu-labels/:id')
  @HttpCode(204)
  removeMenuLabel(@Param('id') id: string) { this.service.removeMenuLabel(id); }

  // ─── Menu Items ───────────────────────────────────────────────────────────

  @Get('menu-items')
  getMenuItems(@Query('labelId') labelId: string) { return this.service.findMenuItemsByLabel(labelId); }

  @Post('menu-items')
  saveMenuItem(@Body() dto: SaveMenuItemDto) { return this.service.saveMenuItem(dto); }

  @Delete('menu-items/:id')
  @HttpCode(204)
  removeMenuItem(@Param('id') id: string) { this.service.removeMenuItem(id); }

  @Post('menu-items/batch')
  replaceMenuItems(@Body() body: { labelId: string; items: { pageId: string; title: string; slug: string; order: number }[] }) {
    return this.service.replaceMenuItems(body.labelId, body.items);
  }

  @Public()
  @Get('app/blogs')
  getAppBlogs(@Query('tenantId') tenantId?: string) {
    return this.service.findAllBlogPosts();
  }
}

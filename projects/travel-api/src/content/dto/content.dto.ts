import { IsArray, IsBoolean, IsEmail, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

// Blog Category
export class CreateBlogCategoryDto {
  @IsString() @IsNotEmpty() name: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() metaRobots?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaKeyword?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

export class UpdateBlogCategoryDto {
  @IsOptional() @IsString() @IsNotEmpty() name?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: 'Active' | 'Inactive';
  @IsOptional() @IsString() metaRobots?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaKeyword?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

// Blog Post
export class CreateBlogPostDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsString() @IsNotEmpty() categoryId: string;
  @IsString() @IsNotEmpty() categoryName: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() postedBy?: string;
  @IsOptional() @IsString() metaRobots?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaKeyword?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

export class UpdateBlogPostDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional() @IsString() categoryName?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsIn(['Active', 'Inactive']) status?: 'Active' | 'Inactive';
  @IsOptional() @IsString() postedBy?: string;
  @IsOptional() @IsString() metaRobots?: string;
  @IsOptional() @IsString() metaTitle?: string;
  @IsOptional() @IsString() metaKeyword?: string;
  @IsOptional() @IsString() metaDescription?: string;
}

// Slider badge
export class SliderBadgeDto {
  @IsString() icon: string;
  @IsString() text: string;
}

// Slider
export class CreateSliderDto {
  @IsIn(['HOTEL', 'FLIGHT', 'HOLIDAY', 'BUS']) serviceType: 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
  @IsIn(['B2C', 'B2B']) userType: 'B2C' | 'B2B';
  @IsIn(['ALL', 'WEB', 'ANDROID', 'IOS']) platform: 'ALL' | 'WEB' | 'ANDROID' | 'IOS';
  @IsString() @IsNotEmpty() mainTitle: string;
  @IsOptional() @IsString() smallSubtitle?: string;
  @IsOptional() @IsString() rightItalicText?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SliderBadgeDto) badges?: SliderBadgeDto[];
  @IsOptional() @IsString() imageUrl?: string;
  @IsNumber() @Min(1) sortOrder: number;
  @IsBoolean() isActive: boolean;
}

export class UpdateSliderDto {
  @IsOptional() @IsIn(['HOTEL', 'FLIGHT', 'HOLIDAY', 'BUS']) serviceType?: 'HOTEL' | 'FLIGHT' | 'HOLIDAY' | 'BUS';
  @IsOptional() @IsIn(['B2C', 'B2B']) userType?: 'B2C' | 'B2B';
  @IsOptional() @IsIn(['ALL', 'WEB', 'ANDROID', 'IOS']) platform?: 'ALL' | 'WEB' | 'ANDROID' | 'IOS';
  @IsOptional() @IsString() mainTitle?: string;
  @IsOptional() @IsString() smallSubtitle?: string;
  @IsOptional() @IsString() rightItalicText?: string;
  @IsOptional() @IsArray() @ValidateNested({ each: true }) @Type(() => SliderBadgeDto) badges?: SliderBadgeDto[];
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsNumber() @Min(1) sortOrder?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

// Newsletter
export class CreateSubscriberDto {
  @IsOptional() @IsString() name?: string;
  @IsEmail() email: string;
  @IsOptional() @IsIn(['Subscribed', 'Unsubscribed']) status?: 'Subscribed' | 'Unsubscribed';
}

export class UpdateSubscriberDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsIn(['Subscribed', 'Unsubscribed']) status?: 'Subscribed' | 'Unsubscribed';
}

// Contact Query
export class UpdateContactQueryDto {
  @IsIn(['New', 'In Progress', 'Resolved']) status: 'New' | 'In Progress' | 'Resolved';
}

// Pages
export class CreatePageDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsString() @IsNotEmpty() template: string;
  @IsIn(['Published', 'Draft', 'Archived']) status: 'Published' | 'Draft' | 'Archived';
  @IsString() @IsNotEmpty() author: string;
  @IsOptional() @IsString() content?: string;
}

export class UpdatePageDto {
  @IsOptional() @IsString() @IsNotEmpty() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() template?: string;
  @IsOptional() @IsIn(['Published', 'Draft', 'Archived']) status?: 'Published' | 'Draft' | 'Archived';
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() content?: string;
}

// Menu
export class CreateMenuLabelDto {
  @IsString() @IsNotEmpty() name: string;
}

export class UpdateMenuLabelDto {
  @IsString() @IsNotEmpty() name: string;
}

export class SaveMenuItemDto {
  @IsOptional() @IsString() id?: string;
  @IsString() @IsNotEmpty() labelId: string;
  @IsString() @IsNotEmpty() pageId: string;
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() slug: string;
  @IsNumber() @Min(0) order: number;
}

// Shared
export class BulkDeleteDto {
  @IsArray() @IsString({ each: true }) ids: string[];
}

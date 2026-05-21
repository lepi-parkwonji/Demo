import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { GalleryCategory } from '@generated/prisma';

export class CreateGalleryDTO {
  @ApiPropertyOptional({ enum: GalleryCategory })
  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @IsString()
  @MinLength(2, { message: '제목은 2자 이상 입력해주세요.' })
  @MaxLength(100, { message: '제목은 100자 이내로 입력해주세요.' })
  title!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @IsString()
  @MaxLength(50000, { message: '내용은 50000자 이내로 입력해주세요.' })
  content!: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: '올바른 URL을 입력해주세요.' })
  videoUrl?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '행사명은 100자 이내로 입력해주세요.' })
  eventName?: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  shootingDate?: string;
}

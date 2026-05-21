import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { GalleryCategory } from '@generated/prisma';
import { OffsetSearchOptionDTO } from '../../../libs/dtos/search-option.dto';

export class GallerySearchOptionDTO extends OffsetSearchOptionDTO {
  @ApiPropertyOptional({ enum: GalleryCategory })
  @IsOptional()
  @IsEnum(GalleryCategory)
  category?: GalleryCategory;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  eventName?: string;
}

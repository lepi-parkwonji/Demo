import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export enum BannerType {
  HERO = 'HERO',
  INTRO = 'INTRO',
  SPONSOR = 'SPONSOR',
  WIDE = 'WIDE',
}

export class CreateBannerDto {
  @ApiProperty({ enum: BannerType })
  @IsEnum(BannerType)
  type!: BannerType;

  @ApiPropertyOptional() @IsOptional() @IsString() title?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() subtitle?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() imageUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() videoUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() linkUrl?: string;

  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) sortOrder?: number;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isExposed?: boolean;
}

export class UpdateBannerDto extends PartialType(CreateBannerDto) {}

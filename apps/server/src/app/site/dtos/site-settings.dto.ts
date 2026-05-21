import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateSiteSettingsDTO {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) businessName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)  businessNo?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(50)  ceoName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(200) address?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30)  phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) email?: string;
}

export class SiteSettingsResponseDTO {
  @ApiProperty() id!: number;
  @ApiProperty() businessName!: string;
  @ApiProperty() businessNo!: string;
  @ApiProperty() ceoName!: string;
  @ApiProperty() address!: string;
  @ApiProperty() phone!: string;
  @ApiProperty() email!: string;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertSitePageDTO {
  @ApiProperty()    @IsString() @MaxLength(100) title!: string;
  @ApiPropertyOptional() @IsOptional() @IsString() content?: string;
}

export class SitePageResponseDTO {
  @ApiProperty() id!: number;
  @ApiProperty() slug!: string;
  @ApiProperty() title!: string;
  @ApiProperty() content!: string;
  @ApiProperty() updatedAt!: string;
}

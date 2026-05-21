import { ApiProperty } from '@nestjs/swagger';
import { GalleryCategory } from '@generated/prisma';

export class GalleryResponseDTO {
  @ApiProperty({ type: Number }) id!: number;
  @ApiProperty({ enum: GalleryCategory }) category!: GalleryCategory;
  @ApiProperty({ type: String }) title!: string;
  @ApiProperty({ type: String }) content!: string;
  @ApiProperty({ type: String, nullable: true }) imageUrl!: string | null;
  @ApiProperty({ type: String, nullable: true }) videoUrl!: string | null;
  @ApiProperty({ type: [String] }) keywords!: string[];
  @ApiProperty({ type: String, nullable: true }) eventName!: string | null;
  @ApiProperty({ type: String, nullable: true }) shootingDate!: string | null;
  @ApiProperty({ type: Boolean }) isPinned!: boolean;
  @ApiProperty({ type: Boolean }) isExposed!: boolean;
  @ApiProperty({ type: String }) createdAt!: string;
  @ApiProperty({ type: String }) updatedAt!: string;
}

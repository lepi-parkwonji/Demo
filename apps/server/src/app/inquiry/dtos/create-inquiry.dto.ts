import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import {
  INQUIRY_AUTHOR_NAME_MAX,
  INQUIRY_AUTHOR_NAME_MIN,
  INQUIRY_CONTENT_MAX,
  INQUIRY_CONTENT_MIN,
  INQUIRY_TITLE_MAX,
  INQUIRY_TITLE_MIN,
} from '@demo-shop/common';

export class CreateInquiryDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  @IsString()
  @MinLength(INQUIRY_TITLE_MIN, { message: `제목은 ${INQUIRY_TITLE_MIN}자 이상 입력해주세요.` })
  @MaxLength(INQUIRY_TITLE_MAX, { message: `제목은 ${INQUIRY_TITLE_MAX}자 이내로 입력해주세요.` })
  title!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  @IsString()
  @MinLength(INQUIRY_CONTENT_MIN, { message: `내용은 ${INQUIRY_CONTENT_MIN}자 이상 입력해주세요.` })
  @MaxLength(INQUIRY_CONTENT_MAX, { message: `내용은 ${INQUIRY_CONTENT_MAX}자 이내로 입력해주세요.` })
  content!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '작성자명을 입력해주세요.' })
  @IsString()
  @MinLength(INQUIRY_AUTHOR_NAME_MIN, { message: `작성자명은 ${INQUIRY_AUTHOR_NAME_MIN}자 이상 입력해주세요.` })
  @MaxLength(INQUIRY_AUTHOR_NAME_MAX, { message: `작성자명은 ${INQUIRY_AUTHOR_NAME_MAX}자 이내로 입력해주세요.` })
  authorName!: string;

  @ApiProperty({ type: Boolean, required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isSecret?: boolean;
}

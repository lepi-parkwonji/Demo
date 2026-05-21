import { ApiProperty } from '@nestjs/swagger';

export class InquiryResponseDTO {
  @ApiProperty({ type: Number, description: '문의 ID' })
  id!: number;

  @ApiProperty({ type: String, description: '제목' })
  title!: string;

  @ApiProperty({ type: String, description: '내용' })
  content!: string;

  @ApiProperty({ type: String, description: '작성자명' })
  authorName!: string;

  @ApiProperty({ type: String, description: '답변 내용', nullable: true })
  answer!: string | null;

  @ApiProperty({ type: Boolean, description: '답변 여부' })
  isAnswered!: boolean;

  @ApiProperty({ type: Boolean, description: '공개 여부' })
  isExposed!: boolean;

  @ApiProperty({ type: Boolean, description: '비밀글 여부' })
  isSecret!: boolean;

  @ApiProperty({ type: String, description: '작성자 고객 ID (UUID)', nullable: true })
  customerId!: string | null;

  @ApiProperty({ type: String, description: '작성일시' })
  createdAt!: string;

  @ApiProperty({ type: String, description: '수정일시' })
  updatedAt!: string;
}

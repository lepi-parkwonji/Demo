import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomerDTO {
  @ApiProperty({ type: String, description: '고객 ID (UUID)' })
  @Expose()
  id!: string;

  @ApiProperty({ type: String, description: '닉네임' })
  @Expose()
  nickname!: string;

  @ApiProperty({ type: String, description: '이메일', required: false })
  @Expose()
  email?: string;

  @ApiProperty({ type: String, description: '프로필 이미지 URL', required: false })
  @Expose()
  profileImage?: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/** 관리자 응답 DTO. @Exclude + @Expose로 password·refreshToken 등 민감 필드를 자동 제거한다. */
@Exclude()
export class AdminDTO {
  @ApiProperty({ 
    type: Number, 
    description: '관리자 ID' 
  })
  @Expose()
  id!: number;

  @ApiProperty({ 
    type: String, 
    description: '관리자 아이디' 
  })
  @Expose()
  username!: string;

  @ApiProperty({ 
    type: String, 
    description: '관리자 표시 이름' 
  })
  @Expose()
  displayName!: string;
}

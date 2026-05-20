import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class KakaoLoginDto {
  @ApiProperty({ type: String, description: '카카오 인가 코드' })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiProperty({ type: String, description: '리다이렉트 URI' })
  @IsString()
  @IsNotEmpty()
  redirectUri!: string;
}

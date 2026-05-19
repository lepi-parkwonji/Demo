import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class AdminSignInDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  @IsString()
  username!: string;

  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '비밀번호를 입력해주세요.' })
  @IsString()
  password!: string;
}

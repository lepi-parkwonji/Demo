import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

/** POST /admin/signin 요청 바디 */
export class AdminSignInDTO {
  @ApiProperty({ 
    type: String, 
    description: '관리자 아이디'
  })
  @IsNotEmpty({ message: '아이디를 입력해주세요.' })
  username!: string;

  @ApiProperty({ 
    type: String, 
    description: '관리자 비밀번호'
  })
  @IsNotEmpty({ 
    message: '비밀번호를 입력해주세요.' 
  })
  password!: string;
}

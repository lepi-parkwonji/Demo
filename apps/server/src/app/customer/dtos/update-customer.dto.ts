import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class UpdateCustomerDto {
  @ApiProperty({ type: String, description: '변경할 닉네임', maxLength: 12 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(12)
  nickname!: string;
}

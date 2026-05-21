import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateRegistrationDTO {
  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(30)
  contact!: string;

  @ApiProperty({ type: String })
  @IsString()
  @MaxLength(100)
  fairName!: string;

  @ApiPropertyOptional({ type: Boolean })
  @IsOptional()
  @IsBoolean()
  marketingConsent?: boolean;
}

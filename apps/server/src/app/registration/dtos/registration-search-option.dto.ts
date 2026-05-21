import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { OffsetSearchOptionDTO } from '../../../libs/dtos/search-option.dto';

export class RegistrationSearchOptionDTO extends OffsetSearchOptionDTO {
  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  fairName?: string;
}

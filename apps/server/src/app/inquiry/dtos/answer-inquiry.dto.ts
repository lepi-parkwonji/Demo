import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { INQUIRY_ANSWER_MAX, INQUIRY_ANSWER_MIN } from '@demo-shop/common';

export class AnswerInquiryDTO {
  @ApiProperty({ type: String })
  @IsNotEmpty({ message: '답변을 입력해주세요.' })
  @IsString()
  @MinLength(INQUIRY_ANSWER_MIN, { message: `답변은 ${INQUIRY_ANSWER_MIN}자 이상 입력해주세요.` })
  @MaxLength(INQUIRY_ANSWER_MAX, { message: `답변은 ${INQUIRY_ANSWER_MAX}자 이내로 입력해주세요.` })
  answer!: string;
}

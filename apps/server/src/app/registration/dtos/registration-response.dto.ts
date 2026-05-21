import { ApiProperty } from '@nestjs/swagger';

export class RegistrationResponseDTO {
  @ApiProperty({ type: Number }) id!: number;
  @ApiProperty({ type: String }) reservationNo!: string;
  @ApiProperty({ type: String }) name!: string;
  @ApiProperty({ type: String }) contact!: string;
  @ApiProperty({ type: String }) fairName!: string;
  @ApiProperty({ type: Boolean }) marketingConsent!: boolean;
  @ApiProperty({ type: String }) createdAt!: string;
  @ApiProperty({ type: String }) updatedAt!: string;
}

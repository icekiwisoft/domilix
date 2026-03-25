import { ApiProperty } from '@nestjs/swagger';
import { IsNumberString } from 'class-validator';

export class VerifyPhoneDto {
  @ApiProperty({ example: '123456' })
  @IsNumberString()
  verification_code!: string;
}

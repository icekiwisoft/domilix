import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '123456' })
  @IsString()
  verification_code!: string;
}

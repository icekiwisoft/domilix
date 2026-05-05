import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  password_confirmation!: string;
}

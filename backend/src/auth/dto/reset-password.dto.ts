import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'reset-token' })
  @IsString()
  @IsOptional()
  token?: string;

  @ApiProperty({ example: 'legacy-reset-token', required: false })
  @IsString()
  @IsOptional()
  code?: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  password_confirmation!: string;
}

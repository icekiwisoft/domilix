import { ApiPropertyOptional, ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @ApiPropertyOptional({ example: 'current-password' })
  @IsOptional()
  @IsString()
  old_password?: string;

  @ApiPropertyOptional({ example: 'current-password' })
  @IsOptional()
  @IsString()
  current_password?: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  @MinLength(8)
  new_password!: string;

  @ApiProperty({ example: 'new-strong-password' })
  @IsString()
  new_password_confirmation!: string;
}

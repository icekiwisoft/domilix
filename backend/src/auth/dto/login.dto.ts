import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class LoginDto {
  @ApiPropertyOptional({ example: 'announcer@domilix.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+237698555511' })
  @IsOptional()
  @Matches(/^[0-9]+$/)
  phone_number?: string;

  @ApiPropertyOptional({ example: 'domilix2024' })
  @IsString()
  @MinLength(1)
  password!: string;
}

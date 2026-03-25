import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Domilix User' })
  @IsString()
  name!: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '+237690000000' })
  @IsOptional()
  @Matches(/^[0-9]+$/)
  phone_number?: string;

  @ApiProperty({ example: 'strong-password-123' })
  @IsString()
  @MinLength(8)
  password!: string;
}

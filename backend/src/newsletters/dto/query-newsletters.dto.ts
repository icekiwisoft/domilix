import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryNewslettersDto {
  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  page?: string;

  @ApiPropertyOptional({ example: '20' })
  @IsOptional()
  @IsNumberString()
  per_page?: string;

  @ApiPropertyOptional({ example: 'client@example.com' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['all', 'verified', 'pending'] })
  @IsOptional()
  @IsIn(['all', 'verified', 'pending'])
  status?: 'all' | 'verified' | 'pending';
}

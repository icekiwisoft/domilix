import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class QueryCategoriesDto {
  @ApiPropertyOptional({ example: 'Apartment' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  search?: string;

  @ApiPropertyOptional({ enum: ['furniture', 'house'] })
  @IsOptional()
  @IsIn(['furniture', 'house'])
  type?: 'furniture' | 'house';

  @ApiPropertyOptional({ example: 'name' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: string | number;
}

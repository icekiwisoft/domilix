import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsIn, IsOptional, IsString } from 'class-validator';

const toArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return undefined;
  return [value];
};

export class QueryCitiesDto {
  @ApiPropertyOptional({ example: 'Douala' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ example: 'CM' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ enum: ['location', 'sale'] })
  @IsOptional()
  @IsIn(['location', 'sale'])
  ad_type?: 'location' | 'sale';

  @ApiPropertyOptional({ enum: ['realestate', 'furniture'] })
  @IsOptional()
  @IsIn(['realestate', 'furniture'])
  type?: 'realestate' | 'furniture';

  @ApiPropertyOptional({ type: [String], example: ['1', '2'] })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  category_id?: string[];

  @ApiPropertyOptional({ example: '8' })
  @IsOptional()
  @IsString()
  limit?: string;

  @ApiPropertyOptional({ enum: ['name', 'count'] })
  @IsOptional()
  @IsIn(['name', 'count'])
  order_by?: 'name' | 'count';

  @ApiPropertyOptional({ enum: ['asc', 'desc'] })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  order?: 'asc' | 'desc';

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  with_count?: string | boolean;
}

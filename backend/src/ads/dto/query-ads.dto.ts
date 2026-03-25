import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNumberString,
  IsOptional,
  IsString,
} from 'class-validator';

const toArray = ({ value }: { value: unknown }) => {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null || value === '') return undefined;
  return [value];
};

export class QueryAdsDto {
  @ApiPropertyOptional({ example: 'announcer-uuid' })
  @IsOptional()
  @IsString()
  AnnouncerId?: string;

  @ApiPropertyOptional({ example: 'Douala' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['furniture', 'realestate'] })
  @IsOptional()
  @IsIn(['furniture', 'realestate'])
  type?: 'furniture' | 'realestate';

  @ApiPropertyOptional({ example: 'price' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  liked?: string;

  @ApiPropertyOptional({ example: '50000' })
  @IsOptional()
  @IsNumberString()
  budget_min?: string;

  @ApiPropertyOptional({ example: '300000' })
  @IsOptional()
  @IsNumberString()
  budget_max?: string;

  @ApiPropertyOptional({ type: [String], example: ['1', '2'] })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  category_id?: string[];

  @ApiPropertyOptional({ enum: ['location', 'sale'] })
  @IsOptional()
  @IsIn(['location', 'sale'])
  ad_type?: 'location' | 'sale';

  @ApiPropertyOptional({ example: 'Douala' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Bonapriso' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiPropertyOptional({ example: 'Bonapriso' })
  @IsOptional()
  @IsString()
  adress?: string;

  @ApiPropertyOptional({ example: 'XOF' })
  @IsOptional()
  @IsString()
  devise?: string;

  @ApiPropertyOptional({ example: 'month' })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsNumberString()
  bedroom_min?: string;

  @ApiPropertyOptional({ example: '4' })
  @IsOptional()
  @IsNumberString()
  bedroom_max?: string;

  @ApiPropertyOptional({ type: [String], example: ['garage', 'pool'] })
  @IsOptional()
  @Transform(toArray)
  @IsArray()
  amenities?: string[];

  @ApiPropertyOptional({ enum: ['standard', 'confort', 'haut_standing'] })
  @IsOptional()
  @IsIn(['standard', 'confort', 'haut_standing'])
  standing?: 'standard' | 'confort' | 'haut_standing';

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  unlocked?: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  likeAdmin?: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: string | number;
}

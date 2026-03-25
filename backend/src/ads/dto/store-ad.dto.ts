import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class StoreAdDto {
  @ApiProperty({ enum: ['realestate', 'furniture'] })
  @IsString()
  @IsIn(['realestate', 'furniture'])
  type!: 'realestate' | 'furniture';

  @ApiProperty({ example: '250000' })
  @IsString()
  price!: string;

  @ApiProperty({ enum: ['location', 'sale'] })
  @IsString()
  @IsIn(['location', 'sale'])
  ad_type!: 'location' | 'sale';

  @ApiProperty({ example: '1' })
  @IsString()
  category_id!: string;

  @ApiPropertyOptional({ example: 'Appartement meuble a Bonapriso' })
  @IsOptional()
  @IsString()
  description?: string;
}

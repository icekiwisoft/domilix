import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

export class CreateBroadcastDto {
  @ApiProperty({ example: 'Pack Pro Agence' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiPropertyOptional({ example: 'Publiez en illimite et obtenez plus de visibilite.' })
  @IsOptional()
  @IsString()
  subtitle?: string;

  @ApiPropertyOptional({ example: '35% OFF' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  badge?: string;

  @ApiPropertyOptional({ example: 'Voir le pack' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  cta?: string;

  @ApiPropertyOptional({ example: '/storage/broadcasts/promo.jpg' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiPropertyOptional({ example: 'from-amber-500 to-orange-600' })
  @IsOptional()
  @IsString()
  bg?: string;

  @ApiPropertyOptional({ example: '/subscriptions' })
  @IsOptional()
  @IsString()
  action_url?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  position?: number;

  @ApiPropertyOptional({ example: '2026-03-27T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  starts_at?: string;

  @ApiPropertyOptional({ example: '2026-12-31T23:59:59.000Z' })
  @IsOptional()
  @IsString()
  ends_at?: string;
}

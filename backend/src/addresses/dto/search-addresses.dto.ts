import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class SearchAddressesDto {
  @ApiProperty({ example: 'douala' })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  query!: string;

  @ApiPropertyOptional({ type: [Number], example: [9.7, 4.05] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => Number)
  proximity?: number[];

  @ApiPropertyOptional({ example: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(10)
  limit?: number;

  @ApiPropertyOptional({ type: [String], example: ['place', 'address'] })
  @IsOptional()
  @IsArray()
  types?: string[];

  @ApiPropertyOptional({ example: 'cm' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ example: 'fr' })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @ApiPropertyOptional({ type: [Number], example: [8.5, 3.8, 11.0, 5.0] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @Type(() => Number)
  bbox?: number[];

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  autocomplete?: boolean;
}

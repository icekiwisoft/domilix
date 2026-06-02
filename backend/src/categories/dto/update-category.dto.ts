import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Appartement' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({ enum: ['house', 'furniture'], example: 'house' })
  @IsOptional()
  @IsString()
  @IsIn(['house', 'furniture'])
  type?: 'house' | 'furniture';
}

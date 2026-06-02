import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Appartement' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiProperty({ enum: ['house', 'furniture'], example: 'house' })
  @IsString()
  @IsIn(['house', 'furniture'])
  type!: 'house' | 'furniture';
}

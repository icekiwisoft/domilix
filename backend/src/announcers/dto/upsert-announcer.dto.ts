import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertAnnouncerDto {
  @ApiProperty({ example: 'Domilix Agency' })
  @IsString()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: '1' })
  @IsOptional()
  @IsString()
  user_id?: string;

  @ApiPropertyOptional({ example: 'Agence specialisee dans limmobilier.' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ example: '+237690000000' })
  @IsOptional()
  @IsString()
  contact?: string;
}

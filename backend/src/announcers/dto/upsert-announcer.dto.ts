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

  @ApiPropertyOptional({
    example: 'https://storage.googleapis.com/bucket/avatars/file.jpg',
  })
  @IsOptional()
  @IsString()
  avatar_url?: string;

  @ApiPropertyOptional({ example: 'domilix-prod' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  avatar_bucket?: string;

  @ApiPropertyOptional({ example: 'avatars/file.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(1024)
  avatar_path?: string;

  @ApiPropertyOptional({ example: 'media-uuid' })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  avatar_media_id?: string;
}

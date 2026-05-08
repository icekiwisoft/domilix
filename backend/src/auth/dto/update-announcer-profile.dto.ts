import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAnnouncerProfileDto {
  @ApiPropertyOptional({ example: 'Domilix Agency' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  company_name?: string;

  @ApiPropertyOptional({ example: 'Agence specialisee dans la location et la vente.' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiPropertyOptional({ example: '+237690000000' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  professional_phone?: string;

  @ApiPropertyOptional({ example: '/storage/announcers/presentation.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  presentation?: string;

  @ApiPropertyOptional({ example: 'https://storage.googleapis.com/bucket/avatars/file.jpg' })
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

  @ApiPropertyOptional({ example: 'media-uuid' })
  @IsOptional()
  @IsString()
  @MaxLength(36)
  presentation_media_id?: string;

  @ApiPropertyOptional({ example: 'https://storage.googleapis.com/bucket/presentations/file.jpg' })
  @IsOptional()
  @IsString()
  presentation_url?: string;
}

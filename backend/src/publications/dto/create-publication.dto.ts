import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreatePublicationDto {
  @IsOptional()
  @IsString()
  ad_id?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  media_ids?: string[];

  @IsOptional()
  @IsBoolean()
  include_videos?: boolean;
}

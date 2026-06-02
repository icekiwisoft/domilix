import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Sujet de la campagne' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  subject?: string;

  @ApiPropertyOptional({ description: 'Contenu HTML de la campagne' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ description: 'Statut (draft/sent)' })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'sent'])
  status?: string;
}

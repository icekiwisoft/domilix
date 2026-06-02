import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Sujet de la campagne' })
  subject?: string;

  @ApiPropertyOptional({ description: 'Contenu HTML de la campagne' })
  content?: string;

  @ApiPropertyOptional({ description: 'Statut (draft/sent)' })
  status?: string;
}

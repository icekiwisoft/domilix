import { ApiProperty } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Sujet de la campagne' })
  subject!: string;

  @ApiProperty({ description: 'Contenu HTML de la campagne' })
  content!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCampaignDto {
  @ApiProperty({ description: 'Sujet de la campagne' })
  @IsString()
  @IsNotEmpty({ message: 'Le sujet est requis.' })
  @MaxLength(500)
  subject!: string;

  @ApiProperty({ description: 'Contenu HTML de la campagne' })
  @IsString()
  @IsNotEmpty({ message: 'Le contenu est requis.' })
  content!: string;
}

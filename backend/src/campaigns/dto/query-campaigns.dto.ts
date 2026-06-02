import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryCampaignsDto {
  @ApiPropertyOptional({ description: 'Page number' })
  page?: string;

  @ApiPropertyOptional({ description: 'Per page' })
  per_page?: string;

  @ApiPropertyOptional({ description: 'Recherche par sujet' })
  search?: string;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';

export class QueryAnnouncersDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  page?: string | number;
}

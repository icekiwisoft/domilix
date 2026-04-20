import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class QueryBroadcastsDto {
  @ApiPropertyOptional({ example: false, description: 'Set true to include inactive broadcasts' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  include_inactive?: boolean;
}

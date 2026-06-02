import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Campaigns')
@Controller()
export class CampaignsController {}

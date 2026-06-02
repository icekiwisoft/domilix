import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { AuthTokenService } from '../auth/auth-token.service';
import { CurrentUser } from '../auth/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';
import { MapsService } from './maps.service';
import { QueryMapsListingsDto, QueryMapsNearbyDto } from './dto/query-maps.dto';

class SubscribeDto {
  @IsString()
  @IsNotEmpty()
  plan!: string;
}

@ApiTags('Maps')
@Controller('maps')
export class MapsController {
  constructor(
    private readonly mapsService: MapsService,
    private readonly tokens: AuthTokenService,
    private readonly prisma: PrismaService,
  ) {}

  private async resolveUserId(request: any) {
    const authorization = request.headers.authorization as string | undefined;
    if (!authorization?.startsWith('Bearer ')) return undefined;

    try {
      const payload = this.tokens.verifyAccessToken(authorization.slice(7));
      const user = await this.prisma.user.findUnique({
        where: { id: BigInt(payload.sub) },
      });
      return user?.id;
    } catch {
      return undefined;
    }
  }

  @Get('listings')
  @ApiOperation({ summary: 'Get map listings with optional bbox filter' })
  async listings(@Query() query: QueryMapsListingsDto, @Req() req: any) {
    return this.mapsService.listings(query, await this.resolveUserId(req));
  }

  @Get('listings/nearby')
  @ApiOperation({ summary: 'Get listings near coordinates' })
  async nearby(@Query() query: QueryMapsNearbyDto, @Req() req: any) {
    return this.mapsService.nearby(query, await this.resolveUserId(req));
  }

  @Get('plans')
  @ApiOperation({ summary: 'List all available Maps plans' })
  async plans() {
    return this.mapsService.getPlans();
  }

  @Post('subscribe')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Subscribe to a Maps plan' })
  async subscribe(@CurrentUser() user: any, @Body() dto: SubscribeDto) {
    return this.mapsService.subscribe(BigInt(user.id), dto.plan);
  }

  @Get('subscription')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current Maps subscription status' })
  async status(@CurrentUser() user: any) {
    return this.mapsService.status(BigInt(user.id));
  }

  @Post('cancel')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel current Maps subscription' })
  async cancel(@CurrentUser() user: any) {
    return this.mapsService.cancel(BigInt(user.id));
  }
}

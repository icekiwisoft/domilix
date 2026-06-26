import { Module } from '@nestjs/common';
import { AdsModule } from '../ads/ads.module';
import { PrismaModule } from '../prisma/prisma.module';
import { PublicationsService } from './publications.service';

@Module({
  imports: [PrismaModule, AdsModule],
  providers: [PublicationsService],
  exports: [PublicationsService],
})
export class PublicationsModule {}

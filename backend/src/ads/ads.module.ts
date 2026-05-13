import { Module } from '@nestjs/common';
import { AddressesModule } from '../addresses/addresses.module';
import { AuthModule } from '../auth/auth.module';
import { AdsController } from './ads.controller';
import { AdsService } from './ads.service';

@Module({
  imports: [AuthModule, AddressesModule],
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}

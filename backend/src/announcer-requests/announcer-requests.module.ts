import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnnouncerRequestsController } from './announcer-requests.controller';
import { AnnouncerRequestsService } from './announcer-requests.service';

@Module({
  imports: [AuthModule],
  controllers: [AnnouncerRequestsController],
  providers: [AnnouncerRequestsService],
})
export class AnnouncerRequestsModule {}

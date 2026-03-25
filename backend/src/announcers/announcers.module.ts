import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnnouncersController } from './announcers.controller';
import { AnnouncersService } from './announcers.service';

@Module({
  imports: [AuthModule],
  controllers: [AnnouncersController],
  providers: [AnnouncersService],
})
export class AnnouncersModule {}

import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AnnouncerMediasController, MediasController } from './medias.controller';
import { MediasService } from './medias.service';

@Module({
  imports: [AuthModule],
  controllers: [MediasController, AnnouncerMediasController],
  providers: [MediasService],
})
export class MediasModule {}

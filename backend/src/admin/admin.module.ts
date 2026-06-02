import { Module } from '@nestjs/common';
import { AdsModule } from '../ads/ads.module';
import { AnnouncerRequestsModule } from '../announcer-requests/announcer-requests.module';
import { AnnouncersModule } from '../announcers/announcers.module';
import { AuthModule } from '../auth/auth.module';
import { BroadcastsModule } from '../broadcasts/broadcasts.module';
import { CampaignsModule } from '../campaigns/campaigns.module';
import { MediasModule } from '../medias/medias.module';
import { NewslettersModule } from '../newsletters/newsletters.module';
import { UsersModule } from '../users/users.module';
import { AdminAnnouncerRequestsController } from './announcer-requests/admin-announcer-requests.controller';
import { AdminAnnouncersController } from './announcers/admin-announcers.controller';
import { AdminAnnouncesController } from './announces/admin-announces.controller';
import { AdminBroadcastsController } from './broadcasts/admin-broadcasts.controller';
import { AdminCampaignsController } from './campaigns/admin-campaigns.controller';
import { AdminMediasController } from './medias/admin-medias.controller';
import { AdminNewslettersController } from './newsletters/admin-newsletters.controller';
import { AdminSubscriptionsController } from './subscriptions/admin-subscriptions.controller';
import { AdminSubscriptionsService } from './subscriptions/admin-subscriptions.service';
import { AdminUsersController } from './users/admin-users.controller';

@Module({
  imports: [
    AuthModule,
    AdsModule,
    AnnouncerRequestsModule,
    AnnouncersModule,
    BroadcastsModule,
    CampaignsModule,
    MediasModule,
    NewslettersModule,
    UsersModule,
  ],
  controllers: [
    AdminAnnouncerRequestsController,
    AdminAnnouncersController,
    AdminAnnouncesController,
    AdminBroadcastsController,
    AdminCampaignsController,
    AdminMediasController,
    AdminNewslettersController,
    AdminSubscriptionsController,
    AdminUsersController,
  ],
  providers: [AdminSubscriptionsService],
})
export class AdminModule {}

import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AdsModule } from './ads/ads.module';
import { AdminModule } from './admin/admin.module';
import { AddressesModule } from './addresses/addresses.module';
import { AnnouncerRequestsModule } from './announcer-requests/announcer-requests.module';
import { AnnouncersModule } from './announcers/announcers.module';
import { AuthModule } from './auth/auth.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { ObjectStorageModule } from './common/object-storage/object-storage.module';
import { MapsModule } from './maps/maps.module';
import { MediasModule } from './medias/medias.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60_000,
      max: 500,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    ObjectStorageModule,
    PrismaModule,
    AuthModule,
    AdminModule,
    BroadcastsModule,
    CampaignsModule,
    AdsModule,
    AddressesModule,
    UsersModule,
    AnnouncerRequestsModule,
    CategoriesModule,
    AnnouncersModule,
    MapsModule,
    MediasModule,
    NewslettersModule,
    NotificationsModule,
    SubscriptionsModule,
    UploadsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}

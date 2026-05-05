import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { AdsModule } from './ads/ads.module';
import { AddressesModule } from './addresses/addresses.module';
import { AnnouncerRequestsModule } from './announcer-requests/announcer-requests.module';
import { AnnouncersModule } from './announcers/announcers.module';
import { AuthModule } from './auth/auth.module';
import { BroadcastsModule } from './broadcasts/broadcasts.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CategoriesModule } from './categories/categories.module';
import { MediasModule } from './medias/medias.module';
import { NewslettersModule } from './newsletters/newsletters.module';
import { NotificationsModule } from './notifications/notifications.module';
import { PrismaModule } from './prisma/prisma.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 60_000,
      max: 500,
    }),
    PrismaModule,
    AuthModule,
    BroadcastsModule,
    AdsModule,
    AddressesModule,
    UsersModule,
    AnnouncerRequestsModule,
    CategoriesModule,
    AnnouncersModule,
    MediasModule,
    NewslettersModule,
    NotificationsModule,
    SubscriptionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

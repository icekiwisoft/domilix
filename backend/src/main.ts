import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import express from 'express';
import path from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: true,
    credentials: true,
  });

  app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    const publicCacheRoutes = ['/categories', '/cities', '/broadcasts'];
    if (req.method === 'GET' && publicCacheRoutes.some(route => req.path.startsWith(route))) {
      res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    }
    next();
  });

  app.use(
    '/storage',
    express.static(path.join(process.cwd(), 'storage'), {
      immutable: true,
      maxAge: '30d',
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Domilix Backend API')
    .setDescription('NestJS API documentation for Domilix backend')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.get('/swagger.json', (_req: express.Request, res: express.Response) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="swagger.json"');
    res.send(swaggerDocument);
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  await app.listen(process.env.PORT ?? 8000);
}

bootstrap();

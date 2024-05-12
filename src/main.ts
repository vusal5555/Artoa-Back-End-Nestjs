import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import multer from 'multer';
import { HttpExceptionFilter } from './exceptions/not-found.exception';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.use(cookieParser());
  app.setGlobalPrefix('api');

  await app.listen(3000);
}
bootstrap();

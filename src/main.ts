import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  Logger,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3000;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  const swaggerPath = 'api-docs';

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ResponseInterceptor(reflector));

  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));

  app.useGlobalFilters(new HttpExceptionFilter());

  app.setGlobalPrefix('api/v1', {
    exclude: [swaggerPath],
  });

  const config = new DocumentBuilder()
    .setTitle('Intern TestCase API')
    .setDescription('API documentation for Intern TestCase project')
    .setVersion('1.0')
    .addTag('users')
    .addTag('auth')
    .addTag('posts')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(swaggerPath, app, document);

  await app.listen(port);

  logger.log(`🚀 Application successfully running on: ${baseUrl}`);
  logger.log(
    `📚 Swagger documentation available at: ${baseUrl}/${swaggerPath}`,
  );
  logger.log(`📡 API base path set to: ${baseUrl}/api/v1`);
}
bootstrap();

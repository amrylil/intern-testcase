import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  const logger = new Logger('Bootstrap');

  const port = process.env.PORT || 3000;
  const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
  const swaggerPath = 'api-docs';

  app.useGlobalPipes(new ValidationPipe());

  app.setGlobalPrefix('api/v1', {
    exclude: [swaggerPath],
  });

  const config = new DocumentBuilder()
    .setTitle('Your API Title')
    .setDescription('API documentation for XYZ project')
    .setVersion('1.0')
    .addTag('users')
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

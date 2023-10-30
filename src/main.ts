import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://103.79.143.150',
      'http://buithanhtho.name.vn',
      'https://buithanhtho.name.vn',
      'http://localhost:5173',
    ],
    credentials: true,
  });

  await app.listen(9000);
}
bootstrap();

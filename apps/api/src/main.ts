import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // <--- ¡AGREGA ESTA LÍNEA MÁGICA!
  await app.listen(3000);
}
bootstrap();
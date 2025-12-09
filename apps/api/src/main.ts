import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔥 ESTA ES LA LÍNEA MÁGICA: Habilita CORS
  // Permite que tu web (localhost:3001) hable con la API (localhost:3000)
  app.enableCors(); 

  await app.listen(3000);
}
bootstrap();
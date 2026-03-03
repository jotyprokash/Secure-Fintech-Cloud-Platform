import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.WORKER_PORT ?? 3002;
  await app.listen(port);
  console.log(`⚙️  NovaPay Worker running on port ${port}`);
}
bootstrap();

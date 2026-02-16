import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // validation input tramite DTO
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,            // rimuove campi non previsti dai DTO
      transform: true,            // converte tipi (es. string->number nei Param)
      forbidNonWhitelisted: true, // 400 se arrivano campi extra
    }),
  );

  app.useGlobalFilters(new HttpExceptionFilter());

  const grpcUrl = process.env.GRPC_URL ?? '0.0.0.0:50051';
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: grpcUrl,
      package: 'giglio',
      protoPath: join(process.cwd(), 'proto', 'giglio.proto'),
    },
  });

  await app.startAllMicroservices();

  const port = Number(process.env.REST_PORT ?? 3000);
  await app.listen(port);

  console.log(`REST nella porta:${port} | gRPC nella porta ${grpcUrl}`);
}

bootstrap();

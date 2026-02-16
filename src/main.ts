import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GrpcExceptionFilter } from './common/filters/grpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      url: process.env.GRPC_URL ?? '0.0.0.0:50051',
      package: 'giglio',
      protoPath: join(process.cwd(), 'proto', 'giglio.proto'),
    },
  });

  app.useGlobalFilters(new GrpcExceptionFilter());

  await app.startAllMicroservices();

  const port = Number(process.env.REST_PORT ?? 3000);
  await app.listen(port);

  console.log(
    `REST nella porta:${port} | gRPC nella porta ${process.env.GRPC_URL ?? '0.0.0.0:50051'}`,
  );
}
bootstrap();

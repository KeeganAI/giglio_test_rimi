import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsGrpcController } from './products.grpc.controller';
import { ProductsService } from './products.service';

@Module({
  controllers: [ProductsController, ProductsGrpcController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}

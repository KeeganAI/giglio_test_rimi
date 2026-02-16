import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersGrpcController } from './orders.grpc.controller';
import { OrdersService } from './orders.service';

@Module({
  controllers: [OrdersController, OrdersGrpcController],
  providers: [OrdersService],
})
export class OrdersModule {}

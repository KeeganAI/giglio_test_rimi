import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { OrdersService } from './orders.service';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';

@UseFilters(new GrpcExceptionFilter())
@Controller()
export class OrdersGrpcController {
  constructor(private readonly orders: OrdersService) {}

  @GrpcMethod('OrdersService', 'CreateOrder')
  createOrder(req: { userId: number; productIds: number[] }) {
    return this.orders.createOrder(req as any);
  }

  @GrpcMethod('OrdersService', 'FindAllOrders')
  async findAllOrders() {
    const items = await this.orders.findAll();
    return { items };
  }

  @GrpcMethod('OrdersService', 'FindOneOrder')
  findOneOrder(req: { id: number }) {
    return this.orders.findOne(req.id);
  }

  @GrpcMethod('OrdersService', 'UpdateOrder')
  updateOrder(req: { id: number; status: string }) {
    const { id, ...dto } = req;
    return this.orders.update(id, dto as any);
  }

  @GrpcMethod('OrdersService', 'RemoveOrder')
  async removeOrder(req: { id: number }) {
    await this.orders.remove(req.id);
    return {};
  }
}

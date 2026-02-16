import { IsEnum } from 'class-validator';
import { OrderStatus } from './order-status.enum';

export class UpdateOrderDto {
  @IsEnum(OrderStatus, { message: 'status non valido.' })
  status!: OrderStatus;
}

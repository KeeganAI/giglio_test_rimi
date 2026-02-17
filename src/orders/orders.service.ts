import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './dto/order-status.enum';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(dto: CreateOrderDto) {
    await this.ensureUser(dto.userId);
    const products = await this.ensureProducts(dto.productIds);

    const totalCents = products.reduce((sum, p) => {
      const n = p.price.toNumber();
      return sum + Math.round(n * 100);
    }, 0);

    const totalAmount = totalCents / 100;

    const order = await this.prisma.order.create({
      data: {
        userId: dto.userId,
        totalAmount: totalAmount as any,
        status: OrderStatus.CREATED as any,
        items: {
          createMany: {
            data: dto.productIds.map((productId) => ({ productId })),
          },
        },
      },
      include: { items: { include: { product: true } } },
    });

    return this.toOrderResponse(order);
  }

  /** lista ordini */
  async findAll() {
    const orders = await this.prisma.order.findMany({
      include: { items: { include: { product: true } } },
    });
    return orders.map((o) => this.toOrderResponse(o));
  }

  /** ritorna ordine singolo con prodotti */
  async findOne(id: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { items: { include: { product: true } } },
    });
    if (!order) throw new NotFoundException('Ordine non trovato');
    return this.toOrderResponse(order);
  }

  /** aggiorna solo status */
  async update(id: number, dto: UpdateOrderDto) {
    await this.findOne(id);

    const order = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status as any },
      include: { items: { include: { product: true } } },
    });

    return this.toOrderResponse(order);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.order.delete({ where: { id } });
  }

  // -------------------- helpers --------------------

  private async ensureUser(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User non trovato');
    return user;
  }

  private async ensureProducts(productIds: number[]) {
    const uniqueIds = Array.from(new Set(productIds));

    const products = await this.prisma.product.findMany({
      where: { id: { in: uniqueIds } },
    });

    if (products.length !== uniqueIds.length) {
      const found = new Set(products.map((p) => p.id));
      const missing = uniqueIds.filter((id) => !found.has(id));
      throw new BadRequestException(`Prodotto mancante: ${missing.join(', ')}`);
    }
    return products;
  }

  /**
   * migliora il response
   */
  private toOrderResponse(order: any) {
    return {
      id: order.id,
      userId: order.userId,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      products: (order.items ?? []).map((it: any) => ({
        productId: it.product?.id ?? it.productId,
        price: Number(it.product?.price),
      })),
    };
  }
}

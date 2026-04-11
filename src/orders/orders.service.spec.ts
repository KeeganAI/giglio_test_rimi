import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  const prismaMock: any = {
    user: { findUnique: jest.fn() },
    product: { findMany: jest.fn() },
    order: { create: jest.fn() },
  };

  const service = new OrdersService(prismaMock);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('createOrder: calcola totalAmount e crea ordine CREATED', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    prismaMock.product.findMany.mockResolvedValue([
      { id: 10, price: { toNumber: () => 2.5 } },
      { id: 11, price: { toNumber: () => 3.0 } },
    ]);

    prismaMock.order.create.mockResolvedValue({
      id: 99,
      userId: 1,
      totalAmount: 5.5,
      status: 'CREATED',
      items: [
        { productId: 10, quantity: 1, product: { id: 10, price: 2.5 } },
        { productId: 11, quantity: 1, product: { id: 11, price: 3.0 } },
      ],
    });

    const res = await service.createOrder({ userId: 1, productIds: [10, 11] });

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });

    expect(prismaMock.product.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
    });

    expect(prismaMock.order.create).toHaveBeenCalledTimes(1);
    const args = prismaMock.order.create.mock.calls[0][0];

    expect(args).toEqual({
      data: {
        userId: 1,
        totalAmount: 5.5,
        status: 'CREATED',
        items: {
          createMany: {
            data: [
              { productId: 10, quantity: 1 },
              { productId: 11, quantity: 1 },
            ],
          },
        },
      },
      include: { items: { include: { product: true } } },
    });

    expect(res).toEqual({
      id: 99,
      userId: 1,
      totalAmount: 5.5,
      status: 'CREATED',
      products: [
        { productId: 10, price: 2.5, quantity: 1 },
        { productId: 11, price: 3.0, quantity: 1 },
      ],
    });
  });

  it('createOrder: user mancante -> 404', async () => {
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(service.createOrder({ userId: 1, productIds: [1] }))
      .rejects.toBeInstanceOf(NotFoundException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.findMany).not.toHaveBeenCalled();
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it('createOrder: prodotti mancanti -> 400', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });
    prismaMock.product.findMany.mockResolvedValue([{ id: 10, price: { toNumber: () => 2.5 } }]);

    await expect(service.createOrder({ userId: 1, productIds: [10, 11] }))
      .rejects.toBeInstanceOf(BadRequestException);

    expect(prismaMock.user.findUnique).toHaveBeenCalledTimes(1);
    expect(prismaMock.product.findMany).toHaveBeenCalledTimes(1);
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it('createOrder: productIds duplicati -> raggruppa per quantità', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    prismaMock.product.findMany.mockResolvedValue([
      { id: 10, price: { toNumber: () => 2.5 } },
      { id: 11, price: { toNumber: () => 3.0 } },
    ]);

    prismaMock.order.create.mockResolvedValue({
      id: 100,
      userId: 1,
      totalAmount: 8.0, // 2.5 * 2 + 3.0 * 1
      status: 'CREATED',
      items: [
        { productId: 10, quantity: 2, product: { id: 10, price: 2.5 } },
        { productId: 11, quantity: 1, product: { id: 11, price: 3.0 } },
      ],
    });

    await service.createOrder({ userId: 1, productIds: [10, 10, 11] });

    // deduplica gli ID per la query
    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
    });

    // raggruppa in items con quantity
    const args = prismaMock.order.create.mock.calls[0][0];
    expect(args.data.items.createMany.data).toEqual([
      { productId: 10, quantity: 2 },
      { productId: 11, quantity: 1 },
    ]);

    // totalAmount = 2.5*2 + 3.0*1 = 8.0
    expect(args.data.totalAmount).toBe(8.0);
  });
});

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
        { productId: 10, product: { id: 10, price: 2.5 } },
        { productId: 11, product: { id: 11, price: 3.0 } },
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
            data: [{ productId: 10 }, { productId: 11 }],
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
        { productId: 10, price: 2.5 },
        { productId: 11, price: 3.0 },
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

  it('createOrder: productIds duplicati -> non raddoppia la query prodotti', async () => {
    prismaMock.user.findUnique.mockResolvedValue({ id: 1 });

    prismaMock.product.findMany.mockResolvedValue([
      { id: 10, price: { toNumber: () => 2.5 } },
      { id: 11, price: { toNumber: () => 3.0 } },
    ]);

    prismaMock.order.create.mockResolvedValue({
      id: 100,
      userId: 1,
      totalAmount: 8.0, // 2.5 + 2.5 + 3.0
      status: 'CREATED',
      items: [
        { productId: 10, product: { id: 10, price: 2.5 } },
        { productId: 10, product: { id: 10, price: 2.5 } },
        { productId: 11, product: { id: 11, price: 3.0 } },
      ],
    });

    await service.createOrder({ userId: 1, productIds: [10, 10, 11] });

    expect(prismaMock.product.findMany).toHaveBeenCalledWith({
      where: { id: { in: [10, 11] } },
    });

    const args = prismaMock.order.create.mock.calls[0][0];
    expect(args.data.items.createMany.data).toEqual([
      { productId: 10 },
      { productId: 10 },
      { productId: 11 },
    ]);
  });
});

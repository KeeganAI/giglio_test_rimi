import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/common/prisma/prisma.service';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('Orders (e2e)', () => {
  let app: INestApplication<App>;

  const prisma = {
    user: { findUnique: jest.fn() },
    product: { findMany: jest.fn() },
    order: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    $connect: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------- POST /orders ----------

  it('POST /orders - body vuoto -> 400', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({})
      .expect(400);
  });

  it('POST /orders - campo extra non previsto -> 400', () => {
    return request(app.getHttpServer())
      .post('/orders')
      .send({ userId: 1, productIds: [1], extraField: 'nope' })
      .expect(400);
  });

  it('POST /orders - user inesistente -> 404', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ userId: 999, productIds: [1] })
      .expect(404);

    expect(res.body.statusCode).toBe(404);
  });

  it('POST /orders - prodotto inesistente -> 400', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.product.findMany.mockResolvedValue([]);

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ userId: 1, productIds: [999] })
      .expect(400);

    expect(res.body.statusCode).toBe(400);
  });

  it('POST /orders - ordine creato con successo -> 201', async () => {
    prisma.user.findUnique.mockResolvedValue({ id: 1 });
    prisma.product.findMany.mockResolvedValue([
      { id: 1, price: { toNumber: () => 2.5 } },
      { id: 2, price: { toNumber: () => 3.0 } },
    ]);
    prisma.order.create.mockResolvedValue({
      id: 1,
      userId: 1,
      totalAmount: 5.5,
      status: 'CREATED',
      items: [
        { productId: 1, quantity: 1, product: { id: 1, price: 2.5 } },
        { productId: 2, quantity: 1, product: { id: 2, price: 3.0 } },
      ],
    });

    const res = await request(app.getHttpServer())
      .post('/orders')
      .send({ userId: 1, productIds: [1, 2] })
      .expect(201);

    expect(res.body).toEqual({
      id: 1,
      userId: 1,
      totalAmount: 5.5,
      status: 'CREATED',
      products: [
        { productId: 1, price: 2.5, quantity: 1 },
        { productId: 2, price: 3.0, quantity: 1 },
      ],
    });
  });

  // ---------- GET /orders ----------

  it('GET /orders -> 200 con lista', async () => {
    prisma.order.findMany.mockResolvedValue([
      {
        id: 1, userId: 1, totalAmount: 5.5, status: 'CREATED',
        items: [{ productId: 1, quantity: 1, product: { id: 1, price: 2.5 } }],
      },
    ]);

    const res = await request(app.getHttpServer())
      .get('/orders')
      .expect(200);

    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
  });

  // ---------- GET /orders/:id ----------

  it('GET /orders/:id - ordine trovato -> 200', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 1, userId: 1, totalAmount: 5.5, status: 'CREATED',
      items: [{ productId: 1, quantity: 1, product: { id: 1, price: 2.5 } }],
    });

    const res = await request(app.getHttpServer())
      .get('/orders/1')
      .expect(200);

    expect(res.body.id).toBe(1);
  });

  it('GET /orders/:id - ordine inesistente -> 404', async () => {
    prisma.order.findUnique.mockResolvedValue(null);

    await request(app.getHttpServer())
      .get('/orders/999')
      .expect(404);
  });

  // ---------- PATCH /orders/:id ----------

  it('PATCH /orders/:id - aggiorna status -> 200', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 1, userId: 1, totalAmount: 5.5, status: 'CREATED',
      items: [{ productId: 1, quantity: 1, product: { id: 1, price: 2.5 } }],
    });
    prisma.order.update.mockResolvedValue({
      id: 1, userId: 1, totalAmount: 5.5, status: 'PAID',
      items: [{ productId: 1, quantity: 1, product: { id: 1, price: 2.5 } }],
    });

    const res = await request(app.getHttpServer())
      .patch('/orders/1')
      .send({ status: 'PAID' })
      .expect(200);

    expect(res.body.status).toBe('PAID');
  });

  it('PATCH /orders/:id - status invalido -> 400', () => {
    return request(app.getHttpServer())
      .patch('/orders/1')
      .send({ status: 'INVALID' })
      .expect(400);
  });

  // ---------- DELETE /orders/:id ----------

  it('DELETE /orders/:id - ordine eliminato -> 204', async () => {
    prisma.order.findUnique.mockResolvedValue({
      id: 1, userId: 1, totalAmount: 5.5, status: 'CREATED',
      items: [],
    });
    prisma.order.delete.mockResolvedValue({});

    await request(app.getHttpServer())
      .delete('/orders/1')
      .expect(204);
  });
});

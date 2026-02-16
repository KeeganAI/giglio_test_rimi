import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';
import { toNumber } from '../common/utils/number.util';
import { ProductsService } from './products.service';

@UseFilters(new GrpcExceptionFilter())
@Controller()
export class ProductsGrpcController {
  constructor(private readonly products: ProductsService) {}

  @GrpcMethod('ProductsService', 'CreateProduct')
  async createProduct(req: { name: string; price: number }) {
    const p = await this.products.create(req as any);
    return { id: p.id, name: p.name, price: toNumber(p.price) };
  }

  @GrpcMethod('ProductsService', 'FindAllProducts')
  async findAllProducts() {
    const items = await this.products.findAll();
    return {
      items: items.map((p) => ({ id: p.id, name: p.name, price: toNumber(p.price) })),
    };
  }

  @GrpcMethod('ProductsService', 'FindOneProduct')
  async findOneProduct(req: { id: number }) {
    const p = await this.products.findOne(req.id);
    return { id: p.id, name: p.name, price: toNumber(p.price) };
  }

  @GrpcMethod('ProductsService', 'UpdateProduct')
  async updateProduct(req: { id: number; name?: string; price?: number }) {
    const { id, ...dto } = req;
    const p = await this.products.update(id, dto as any);
    return { id: p.id, name: p.name, price: toNumber(p.price) };
  }

  @GrpcMethod('ProductsService', 'RemoveProduct')
  async removeProduct(req: { id: number }) {
    await this.products.remove(req.id);
    return {};
  }
}

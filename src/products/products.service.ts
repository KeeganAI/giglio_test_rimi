import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /** CREATE */
  create(dto: CreateProductDto) {
    return this.prisma.product.create({
      data: {
        name: dto.name,
        price: dto.price as any,
      },
    });
  }

  /** lista prodotti */
  findAll() {
    return this.prisma.product.findMany();
  }

  /** ritorna un prodotto, altrimenti 404 */
  async findOne(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) throw new NotFoundException('Prodotto non trovato');
    return product;
  }

  /** UPDATE */
  async update(id: number, dto: UpdateProductDto) {
    await this.findOne(id);
    return this.prisma.product.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.price !== undefined ? { price: dto.price as any } : {}),
      },
    });
  }

  /** DELETE */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.product.delete({ where: { id } });
  }
}

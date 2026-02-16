import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * CREATE
   * Crea un utente.
   * - 409 se l'email è già presente (throwIfUniqueEmail)
   */
  async create(dto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: dto });
    } catch (e) {
      this.throwIfUniqueEmail(e);
      throw e;
    }
  }

  /* lista utenti */
  findAll() {
    return this.prisma.user.findMany();
  }

  /**
   * GET ONE , ritorna un utente
   * - 404 se non esiste
   */
  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Utente non trovato');
    return user;
  }

  /**
   * UPDATE
   * - 404 se non esiste
   * - 409 se l'email aggiornata quella in input collide con un'altra già in uso
   */
  async update(id: number, dto: UpdateUserDto) {
    await this.findOne(id);
    try {
      return await this.prisma.user.update({ where: { id }, data: dto });
    } catch (e) {
      this.throwIfUniqueEmail(e);
      throw e;
    }
  }

  /**
   * DELETE
   * - 404 se non esiste
   */
  async remove(id: number) {
    await this.findOne(id);
    await this.prisma.user.delete({ where: { id } });
  }

  /** Mappa l'errore Prisma P2002 (unique violation) in 409 Conflict 
   * "Unique constraint failed on the {constraint}"
  */
  private throwIfUniqueEmail(e: unknown) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      throw new ConflictException('Email in uso.');
    }
  }
}

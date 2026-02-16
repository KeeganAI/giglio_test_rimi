import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly users: UsersService) {}

  /** POST /users - crea utente */
  @Post()
  create(@Body() dto: CreateUserDto) {
    return this.users.create(dto);
  }

  /** GET /users - ritorna una lista con tutti gli utenti */
  @Get()
  findAll() {
    return this.users.findAll();
  }

  /** GET /users/:id - ritorna dati utente */
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.users.findOne(id);
  }

  /** PATCH /users/:id - modifica utente */
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.users.update(id, dto);
  }

  /** DELETE /users/:id - elimina utente (204 per il no content) */
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.users.remove(id);
  }
}

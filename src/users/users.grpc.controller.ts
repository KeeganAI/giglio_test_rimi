import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';

// Applichiamo il filtro SOLO al contesto gRPC
@UseFilters(new GrpcExceptionFilter())

@Controller()
export class UsersGrpcController {
  constructor(private readonly users: UsersService) {}

  @GrpcMethod('UsersService', 'CreateUser')
  createUser(req: CreateUserReq) {
    return this.users.create(req);
  }

  @GrpcMethod('UsersService', 'FindAllUsers')
  async findAllUsers() {
    const items = await this.users.findAll();
    return { items };
  }

  @GrpcMethod('UsersService', 'FindOneUser')
  findOneUser(req: IdReq) {
    return this.users.findOne(req.id);
  }

  @GrpcMethod('UsersService', 'UpdateUser')
  updateUser(req: UpdateUserReq) {
    const { id, ...dto } = req;
    return this.users.update(id, dto);
  }

  @GrpcMethod('UsersService', 'RemoveUser')
  async removeUser(req: IdReq) {
    await this.users.remove(req.id);
    return {};
  }
}

type IdReq = { id: number };
type CreateUserReq = { name: string; email: string };
type UpdateUserReq = { id: number; name?: string; email?: string };

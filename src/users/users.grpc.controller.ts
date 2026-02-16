import { Controller, UseFilters } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { UsersService } from './users.service';
import { GrpcExceptionFilter } from '../common/filters/grpc-exception.filter';

// Applichiamo il filtro SOLO al contesto gRPC
@UseFilters(new GrpcExceptionFilter())

@Controller()
export class UsersGrpcController {
  constructor(private readonly users: UsersService) {}

  /** CreateUser (gRPC) */
  @GrpcMethod('UsersService', 'CreateUser')
  createUser(req: CreateUserReq) {
    return this.users.create(req);
  }

  /** FindAllUsers (gRPC) */
  @GrpcMethod('UsersService', 'FindAllUsers')
  async findAllUsers() {
    const items = await this.users.findAll();
    return { items };
  }

  /** FindOneUser (gRPC) */
  @GrpcMethod('UsersService', 'FindOneUser')
  findOneUser(req: IdReq) {
    return this.users.findOne(req.id);
  }

  /** UpdateUser (gRPC) */
  @GrpcMethod('UsersService', 'UpdateUser')
  updateUser(req: UpdateUserReq) {
    const { id, ...dto } = req;
    return this.users.update(id, dto);
  }

  /**
   * RemoveUser (gRPC)
   */
  @GrpcMethod('UsersService', 'RemoveUser')
  async removeUser(req: IdReq) {
    await this.users.remove(req.id);
    return {};
  }
}

type IdReq = { id: number };
type CreateUserReq = { name: string; email: string };
type UpdateUserReq = { id: number; name?: string; email?: string };

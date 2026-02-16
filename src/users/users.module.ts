import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersGrpcController } from './users.grpc.controller';
import { UsersService } from './users.service';

@Module({
  controllers: [UsersController, UsersGrpcController],

  providers: [UsersService],

  // export per altri moduli, per gli order?
  exports: [UsersService],
})
export class UsersModule {}

import { Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Catch()
export class GrpcExceptionFilter extends BaseRpcExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    if (exception instanceof RpcException) {
      return super.catch(exception, host);
    }

    if (exception instanceof HttpException) {
      const httpStatus = exception.getStatus();
      const response = exception.getResponse() as any;

      const message =
        typeof response === 'string'
          ? response
          : response?.message ?? 'Error';

      const grpcCode = mapHttpToGrpc(httpStatus);

      return super.catch(
        new RpcException({
          code: grpcCode,
          message: Array.isArray(message) ? message.join(', ') : String(message),
        }),
        host,
      );
    }

    return super.catch(
      new RpcException({ code: GrpcStatus.INTERNAL, message: 'Internal error' }),
      host,
    );
  }
}

function mapHttpToGrpc(http: number): number {
  switch (http) {
    case HttpStatus.BAD_REQUEST:
      return GrpcStatus.INVALID_ARGUMENT;
    case HttpStatus.NOT_FOUND:
      return GrpcStatus.NOT_FOUND;
    case HttpStatus.CONFLICT:
      return GrpcStatus.ALREADY_EXISTS;
    case HttpStatus.UNAUTHORIZED:
      return GrpcStatus.UNAUTHENTICATED;
    case HttpStatus.FORBIDDEN:
      return GrpcStatus.PERMISSION_DENIED;
    default:
      return GrpcStatus.INTERNAL;
  }
}

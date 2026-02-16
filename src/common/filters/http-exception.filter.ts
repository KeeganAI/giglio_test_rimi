import {
  Catch, ExceptionFilter, HttpException,
  HttpStatus,
  ArgumentsHost
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // http filter 
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    // status per exception
    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    // getResponse() in string o obj
    const raw = isHttp ? exception.getResponse() : { message: 'Internal server error' };
    const error = typeof raw === 'string' ? { message: raw } : raw;

    res.status(status).json({
      statusCode: status,
      method: req.method,
      path: req.url,
      timestamp: new Date().toISOString(),
      error,
    });
  }
}

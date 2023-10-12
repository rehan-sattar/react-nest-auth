import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

interface CustomException {
  message: string | string[];
  statusCode: number;
  error: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  logger: Logger;
  constructor() {
    this.logger = new Logger('Global Exception Handler');
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raisedExceptionResponse = (
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: ['Internal server error'], statusCode: status, error: 'InternalServerError' }
    ) as CustomException;

    const message =
      typeof raisedExceptionResponse === 'string' ? raisedExceptionResponse : raisedExceptionResponse.message;
    const error = raisedExceptionResponse.error;
    const path = request.path;

    response.status(status).json({
      message: Array.isArray(message) ? message : [message],
      statusCode: status,
      error,
      path,
    });
  }
}

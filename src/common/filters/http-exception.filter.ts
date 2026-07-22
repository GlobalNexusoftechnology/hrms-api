import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    console.error(exception);
    const ctx = host.switchToHttp();

    const response = ctx.getResponse<Response>();

    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let message = 'Internal Server Error';

    let errors: any[] = [];

    if (exceptionResponse && typeof exceptionResponse === 'object') {
      const responseObj = exceptionResponse as any;

      if (Array.isArray(responseObj.message)) {
        errors = responseObj.message;

        message = 'Validation Error';
      } else {
        message = responseObj.message || message;
        
        if (typeof message === 'string' && (message.includes('JSON at position') || message.includes('Unexpected token'))) {
          errors = [{ field: 'payload', message: 'Invalid JSON format' }];
          message = 'Validation Error';
        }
      }
    }

    response.status(status).json({
      success: false,
      statusCode: status,
      path: request.url,
      timestamp: new Date().toISOString(),
      message,
      errors,
    });
  }
}

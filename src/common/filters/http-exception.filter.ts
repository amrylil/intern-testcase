import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errors?: any;
  path: string;
  timestamp: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse();
    let errorMessage: string;
    let errorDetails: any = null;

    if (typeof exceptionResponse === 'string') {
      errorMessage = exceptionResponse;
    } else {
      const resp = exceptionResponse as any;
      errorMessage = resp.message || 'An unexpected error occurred';

      if (Array.isArray(resp.message)) {
        errorMessage = resp.error || 'Validation Failed';
        errorDetails = resp.message;
      }
    }

    const errorResponse: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message: errorMessage,
      errors: errorDetails,
      path: request.url,
      timestamp: new Date().toISOString(),
    };

    // Log error
    this.logger.error(
      `[${request.method} ${request.url}] Status: ${status} - Message: ${errorMessage}`,
      exception.stack,
    );

    response.status(status).json(errorResponse);
  }
}

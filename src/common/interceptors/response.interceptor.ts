import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { PaginationMeta } from '../interfaces/pagination.interface';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T | T[];
  meta?: PaginationMeta;
}

@Injectable()
export class ResponseInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const message =
      this.reflector.get<string>(RESPONSE_MESSAGE_KEY, context.getHandler()) ||
      'Request successful';

    return next.handle().pipe(
      map((data) => {
        if (data && data.meta && Array.isArray(data.data)) {
          return {
            success: true,
            message: message,
            data: data.data,
            meta: data.meta,
          };
        }

        return {
          success: true,
          message: message,
          data: data,
        };
      }),
    );
  }
}

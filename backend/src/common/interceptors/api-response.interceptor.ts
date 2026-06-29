import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { ApiCode, ApiSuccessResponse } from '@teamboard/shared';
import { Request } from 'express';
import { Observable, map } from 'rxjs';

@Injectable()
export class ApiResponseInterceptor<TData> implements NestInterceptor<TData, ApiSuccessResponse<TData>> {
  intercept(context: ExecutionContext, next: CallHandler<TData>): Observable<ApiSuccessResponse<TData>> {
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      map((data) => ({
        success: true,
        code: ApiCode.Success,
        message: 'Request completed successfully',
        data,
        path: request.url,
        timestamp: new Date().toISOString()
      }))
    );
  }
}

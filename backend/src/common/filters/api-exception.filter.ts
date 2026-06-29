import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ApiCode, ApiErrorResponse } from '@teamboard/shared';
import { Request, Response } from 'express';
import { HttpErrorResponseBody } from '../contracts/http-error-response-body.interface';
import { NormalizedApiError } from '../contracts/normalized-api-error.interface';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter<Error> {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: Error, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();
    const status = this.getStatus(exception);
    const error = this.getErrorDetail(exception, status);
    const envelope: ApiErrorResponse = {
      success: false,
      code: error.code,
      message: error.message,
      errors: error.errors,
      path: request.url,
      timestamp: new Date().toISOString()
    };

    this.logger.error(`${request.method} ${request.url} failed with ${status}: ${error.message}`, exception.stack);
    response.status(status).json(envelope);
  }

  private getStatus(exception: Error): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getErrorDetail(exception: Error, status: number): NormalizedApiError {
    if (exception instanceof HttpException) {
      return this.getHttpErrorDetail(exception, status);
    }

    return {
      code: ApiCode.InternalError,
      message: 'Internal server error',
      errors: []
    };
  }

  private getHttpErrorDetail(exception: HttpException, status: number): NormalizedApiError {
    const responseBody = exception.getResponse();

    if (typeof responseBody === 'string') {
      return {
        code: this.getApiCode(status, false),
        message: responseBody,
        errors: []
      };
    }

    const errorResponse = responseBody as HttpErrorResponseBody;
    const message = errorResponse.message ?? exception.message;
    const errors = Array.isArray(errorResponse.message) ? errorResponse.message : [];

    return {
      code: this.getApiCode(status, errors.length > 0),
      message: Array.isArray(message) ? message.join(', ') : message,
      errors
    };
  }

  private getApiCode(status: number, hasValidationErrors: boolean): ApiCode {
    if (hasValidationErrors) {
      return ApiCode.ValidationError;
    }

    switch (status) {
      case HttpStatus.BAD_REQUEST:
        return ApiCode.BadRequest;
      case HttpStatus.UNAUTHORIZED:
        return ApiCode.Unauthorized;
      case HttpStatus.FORBIDDEN:
        return ApiCode.Forbidden;
      case HttpStatus.NOT_FOUND:
        return ApiCode.NotFound;
      case HttpStatus.CONFLICT:
        return ApiCode.Conflict;
      default:
        return ApiCode.InternalError;
    }
  }
}

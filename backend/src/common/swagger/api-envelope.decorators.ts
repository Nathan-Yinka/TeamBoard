import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiExtraModels,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  getSchemaPath
} from '@nestjs/swagger';
import { ApiCode } from '@teamboard/shared';
import { ApiErrorEnvelopeDto, ApiSuccessEnvelopeDto } from './api-envelope.dto';

interface ApiEnvelopeOptions<TModel extends Type<object>> {
  description: string;
  model: TModel;
  example: ApiSuccessEnvelopeExample;
  isArray?: boolean;
}

interface ApiSuccessEnvelopeExample {
  success: true;
  code: ApiCode.Success;
  message: string;
  data: object | readonly object[];
  path: string;
  timestamp: string;
}

interface ApiErrorEnvelopeExample {
  success: false;
  code: Exclude<ApiCode, ApiCode.Success>;
  message: string;
  errors: readonly string[];
  path: string;
  timestamp: string;
}

const unauthorizedExample: ApiErrorEnvelopeExample = {
  success: false,
  code: ApiCode.Unauthorized,
  message: 'Authentication is required',
  errors: ['Missing or invalid bearer token'],
  path: '/projects',
  timestamp: '2026-06-28T12:00:00.000Z'
};

const badRequestExample: ApiErrorEnvelopeExample = {
  success: false,
  code: ApiCode.ValidationError,
  message: 'Validation failed',
  errors: ['name must be longer than or equal to 2 characters'],
  path: '/projects',
  timestamp: '2026-06-28T12:00:00.000Z'
};

const notFoundExample: ApiErrorEnvelopeExample = {
  success: false,
  code: ApiCode.NotFound,
  message: 'Resource not found',
  errors: ['The requested resource could not be found'],
  path: '/projects/665f1c5c8a0f0f0012ab34cd',
  timestamp: '2026-06-28T12:00:00.000Z'
};

const conflictExample: ApiErrorEnvelopeExample = {
  success: false,
  code: ApiCode.Conflict,
  message: 'Resource already exists',
  errors: ['A user with this email already exists'],
  path: '/auth/signup',
  timestamp: '2026-06-28T12:00:00.000Z'
};

export function ApiEnvelopeOk<TModel extends Type<object>>(options: ApiEnvelopeOptions<TModel>): MethodDecorator {
  const dataSchema = options.isArray
    ? {
        type: 'array',
        items: { $ref: getSchemaPath(options.model) }
      }
    : { $ref: getSchemaPath(options.model) };

  return applyDecorators(
    ApiExtraModels(ApiSuccessEnvelopeDto, options.model),
    ApiOkResponse({
      description: options.description,
      schema: {
        allOf: [
          { $ref: getSchemaPath(ApiSuccessEnvelopeDto) },
          {
            properties: {
              data: dataSchema
            }
          }
        ],
        example: options.example
      }
    })
  );
}

export function ApiEnvelopeUnauthorized(): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ApiErrorEnvelopeDto),
    ApiUnauthorizedResponse({
      description: 'Bearer token is missing, invalid, or expired.',
      type: ApiErrorEnvelopeDto,
      example: unauthorizedExample
    })
  );
}

export function ApiEnvelopeBadRequest(): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ApiErrorEnvelopeDto),
    ApiBadRequestResponse({
      description: 'Request validation failed.',
      type: ApiErrorEnvelopeDto,
      example: badRequestExample
    })
  );
}

export function ApiEnvelopeNotFound(description = 'The requested resource was not found.'): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ApiErrorEnvelopeDto),
    ApiNotFoundResponse({
      description,
      type: ApiErrorEnvelopeDto,
      example: notFoundExample
    })
  );
}

export function ApiEnvelopeConflict(): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ApiErrorEnvelopeDto),
    ApiConflictResponse({
      description: 'The request conflicts with an existing resource.',
      type: ApiErrorEnvelopeDto,
      example: conflictExample
    })
  );
}

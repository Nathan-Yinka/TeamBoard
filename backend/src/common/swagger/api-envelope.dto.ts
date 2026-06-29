import { ApiProperty } from '@nestjs/swagger';
import { ApiCode } from '@teamboard/shared';

export class ApiSuccessEnvelopeDto {
  @ApiProperty({ example: true })
  success: true;

  @ApiProperty({ enum: [ApiCode.Success], example: ApiCode.Success })
  code: ApiCode.Success;

  @ApiProperty({ example: 'Request completed successfully' })
  message: string;

  @ApiProperty({ description: 'Endpoint-specific payload.' })
  data: object;

  @ApiProperty({ example: '/projects' })
  path: string;

  @ApiProperty({ example: '2026-06-28T12:00:00.000Z' })
  timestamp: string;
}

export class ApiErrorEnvelopeDto {
  @ApiProperty({ example: false })
  success: false;

  @ApiProperty({
    enum: ApiCode,
    example: ApiCode.ValidationError,
    examples: [ApiCode.ValidationError, ApiCode.Unauthorized, ApiCode.NotFound, ApiCode.Conflict]
  })
  code: ApiCode;

  @ApiProperty({ example: 'Validation failed' })
  message: string;

  @ApiProperty({ example: ['email must be an email'], type: [String] })
  errors: string[];

  @ApiProperty({ example: '/auth/signup' })
  path: string;

  @ApiProperty({ example: '2026-06-28T12:00:00.000Z' })
  timestamp: string;
}

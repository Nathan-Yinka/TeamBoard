import { ApiCode } from '@teamboard/shared';

export interface NormalizedApiError {
  code: ApiCode;
  message: string;
  errors: string[];
}

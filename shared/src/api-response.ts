import { ApiCode } from './enums/api-code.enum';

export interface ApiSuccessResponse<TData> {
  success: true;
  code: ApiCode.Success;
  message: string;
  data: TData;
  path: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  code: ApiCode;
  message: string;
  errors: string[];
  path: string;
  timestamp: string;
}

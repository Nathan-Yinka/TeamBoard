import type { ApiErrorResponse, ApiSuccessResponse } from '@teamboard/shared';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors: string[]
  ) {
    super(message);
  }
}

export class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  setToken(token: string | null): void {
    if (token) {
      this.client.defaults.headers.common.Authorization = `Bearer ${token}`;
      return;
    }

    delete this.client.defaults.headers.common.Authorization;
  }

  async get<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>({ url: path, method: 'GET' });
  }

  async post<TResponse, TBody extends object>(path: string, body: TBody): Promise<TResponse> {
    return this.request<TResponse>({ url: path, method: 'POST', data: body });
  }

  async patch<TResponse, TBody extends object>(path: string, body: TBody): Promise<TResponse> {
    return this.request<TResponse>({ url: path, method: 'PATCH', data: body });
  }

  async delete<TResponse>(path: string): Promise<TResponse> {
    return this.request<TResponse>({ url: path, method: 'DELETE' });
  }

  private async request<TResponse>(config: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.client
      .request<ApiSuccessResponse<TResponse>>(config)
      .catch((error: object) => Promise.reject(this.toApiError(error)));

    return response.data.data;
  }

  private toApiError(error: object): ApiError {
    if (axios.isAxiosError<ApiErrorResponse>(error) && error.response) {
      const body = error.response.data;
      return new ApiError(body.message, error.response.status, body.errors);
    }

    return new ApiError('Network request failed', 0, ['Network request failed']);
  }
}

export const apiClient = new ApiClient();

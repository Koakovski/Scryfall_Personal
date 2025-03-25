import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Result } from "../../common/result";

class HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string, headers: Record<string, string> = {}) {
    this.axiosInstance = axios.create({
      baseURL,
      headers,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<Result<T>> {
    return this.handleRequest<T>(this.axiosInstance.get(url, config));
  }

  async post<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.handleRequest<T>(this.axiosInstance.post(url, data, config));
  }

  async put<T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.handleRequest<T>(this.axiosInstance.put(url, data, config));
  }

  async delete<T>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<Result<T>> {
    return this.handleRequest<T>(this.axiosInstance.delete(url, config));
  }

  private async handleRequest<T>(
    request: Promise<AxiosResponse<T>>
  ): Promise<Result<T>> {
    try {
      const response = await request;
      return Result.success(response.data);
    } catch (error) {
      return Result.fail(this.extractErrorMessage(error));
    }
  }

  private extractErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || error.message;
    }
    return "An unknown error occurred";
  }
}

export default HttpClient;

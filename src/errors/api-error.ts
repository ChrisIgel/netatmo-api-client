import { AxiosError } from 'axios';

export class NetatmoApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
    public readonly data: unknown,
    public readonly cause: AxiosError
  ) {
    super();
  }
}

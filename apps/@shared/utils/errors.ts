import { AxiosError } from 'axios';

export function isAxiosError(error: Error): error is AxiosError {
  return !!(error as AxiosError).isAxiosError;
}

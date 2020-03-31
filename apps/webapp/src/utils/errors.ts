import { isAxiosError } from '../../../@shared/utils/errors';

export function getErrorMessage(error: any): string {
  if (isAxiosError(error) && error.response?.data) {
    return error.response.data;
  }
  return error.message;
}

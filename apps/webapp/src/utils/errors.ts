export function getErrorMessage(error: Error & { code?: string }): string {
  return error.message;
}

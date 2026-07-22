import { HttpErrorResponse } from '@angular/common/http';

/** Pulls the human-readable message out of the BE's { success:false, error:{code,message} } envelope. */
export function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    return err.error?.error?.message ?? fallback;
  }
  return fallback;
}

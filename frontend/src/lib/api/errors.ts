import { ApiRequestError } from "./http";

export function isAccessError(error: unknown) {
  return error instanceof ApiRequestError && [401, 403].includes(error.status);
}

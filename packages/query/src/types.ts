import { ResponseType } from '@repo/open-api';

export interface OpenAPIResponse {
  data: ResponseType[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

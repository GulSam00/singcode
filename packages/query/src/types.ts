import { ResponseType } from '@repo/open-api';

export interface UseQueryReturn {
  data: ResponseType[] | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

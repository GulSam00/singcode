import { apiRequest } from './instance';

import type { Brand, ResponseType } from './types';

interface GetSingerProps {
  singer: string;
  brand?: Brand;
}

const getSinger = async ({ singer, brand }: GetSingerProps): Promise<ResponseType | null> => {
  const response = await apiRequest('/singer', singer, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getSinger;

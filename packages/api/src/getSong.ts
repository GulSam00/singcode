import { apiRequest } from './instance';

import type { Brand, ResponseType } from './types';

interface GetSongProps {
  title: string;
  brand?: Brand;
}

const getSong = async ({ title, brand }: GetSongProps): Promise<ResponseType | null> => {
  const response = await apiRequest('/song', title, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getSong;

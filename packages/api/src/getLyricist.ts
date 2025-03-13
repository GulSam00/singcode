import { apiRequest } from './instance';

import type { Brand, ResponseType } from './types';

interface GetLyricistProps {
  lyricist: string;
  brand?: Brand;
}

const getLyricist = async ({ lyricist, brand }: GetLyricistProps): Promise<ResponseType | null> => {
  const response = await apiRequest('/lyricist', lyricist, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getLyricist;

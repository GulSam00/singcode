import { apiRequest } from './instance';

import type { Brand, ResponseType } from './types';

interface GetComposerProps {
  composer: string;
  brand?: Brand;
}

const getComposer = async ({ composer, brand }: GetComposerProps): Promise<ResponseType | null> => {
  const response = await apiRequest('/composer', composer, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getComposer;

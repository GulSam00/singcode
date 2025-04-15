import { apiRequest } from './instance';

import type { Brand, ResponseType } from './types';

interface GetNoProps {
  no: string;
  brand?: Brand;
}

const GetNo = async ({ no, brand }: GetNoProps): Promise<ResponseType[] | null> => {
  const response = await apiRequest('/no', no, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default GetNo;

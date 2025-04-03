import { apiRequest, isVaildBrand, isVaildPeriod } from './instance';

import type { Brand, Period, ResponseType } from './types';

interface GetPopularProps {
  brand: Brand;
  period: Period;
}

const getPopular = async ({ brand, period }: GetPopularProps): Promise<ResponseType[] | null> => {
  if (!isVaildBrand(brand)) {
    throw new Error('Invalid brand type');
  }

  if (!isVaildPeriod(period)) {
    throw new Error('Invalid period type');
  }

  const response = await apiRequest('/popular', `${brand}/${period}`);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getPopular;

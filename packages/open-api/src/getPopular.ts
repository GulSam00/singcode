import { apiRequest, isValidBrand, isValidPeriod } from "./instance";

import type { Brand, Period, ResponseType } from "./types";

interface GetPopularProps {
  brand: Brand;
  period: Period;
}

const getPopular = async ({
  brand,
  period,
}: GetPopularProps): Promise<ResponseType[] | null> => {
  if (!isValidBrand(brand)) {
    throw new Error("Invalid brand type");
  }

  if (!isValidPeriod(period)) {
    throw new Error("Invalid period type");
  }

  const response = await apiRequest("/popular", `${brand}/${period}`);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getPopular;

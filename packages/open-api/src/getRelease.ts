import { apiRequest } from "./instance";

import type { Brand, ResponseType } from "./types";

interface GetReleaseProps {
  release: string;
  brand?: Brand;
}

const getRelease = async ({
  release,
  brand,
}: GetReleaseProps): Promise<ResponseType[] | null> => {
  const response = await apiRequest("/release", release, brand);

  if (!response.success) {
    return null;
  }

  return response.data;
};

export default getRelease;

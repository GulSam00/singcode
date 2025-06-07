import { instance } from "./instance";

import type { Brand, ResponseType } from "./types";

interface GetComposerProps {
  brand?: Brand;
}

const getIndex = async ({
  brand,
}: GetComposerProps): Promise<ResponseType[] | null> => {
  const response = await instance(`/${brand}.json`);

  // console.log(response);
  console.log(response.data);

  console.log(response.data.length);
  return response.data;
};

export default getIndex;

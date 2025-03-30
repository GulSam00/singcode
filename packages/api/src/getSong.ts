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

// const getSong = async ({ title, brand = ['tj', 'kumyoung'] }: GetSongProps): Promise<ResponseType | null> => {
//   const responseArray = await Promise.all(brand.map((brand) => apiRequest('/song', title, brand)));

//   if (!responseArray.every((response) => response.success)) {
//     return null;
//   }
//   const response = responseArray.map((response) => response.data);
//   console.log('response', response);

//   return null;
//   //  return response;
// };

export default getSong;

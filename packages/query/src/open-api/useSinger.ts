import { useQuery } from '@tanstack/react-query';
import { getSinger, Brand } from '@repo/open-api';
import { OpenAPIResponse } from '../types';

interface GetSingerProps {
  singer: string;
  brand?: Brand;
}

const useSinger = (props: GetSingerProps): OpenAPIResponse => {
  const { singer, brand } = props;

  // queryKey를 위한 brandKey 생성 (없으면 'all' 사용)
  const brandKey = brand || 'all';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['open', 'singer', singer, brandKey],
    queryFn: () => getSinger({ singer, brand }),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useSinger;

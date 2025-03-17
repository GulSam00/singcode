import { useQuery } from '@tanstack/react-query';
import { getSinger, Brand } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetSingerProps {
  singer: string;
  brand?: Brand;
}

const useSinger = (props: GetSingerProps): UseQueryReturn => {
  const { singer, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['singer', { singer, brand }],
    queryFn: () => getSinger(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useSinger;

import { useQuery } from '@tanstack/react-query';
import { getSong, Brand, ResponseType } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetSongProps {
  title: string;
  brand?: Brand;
}

const useSong = (props: GetSongProps): UseQueryReturn => {
  const { title, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['song', { title, brand }],
    queryFn: () => getSong(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useSong;

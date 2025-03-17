import { useQuery } from '@tanstack/react-query';
import { getSong } from '@repo/api';
import { Brand } from '@repo/api/src/types';
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

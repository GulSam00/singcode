import { useQuery } from '@tanstack/react-query';
import { getLyricist, Brand } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetLyricistProps {
  lyricist: string;
  brand?: Brand;
}

const useLyricist = (props: GetLyricistProps): UseQueryReturn => {
  const { lyricist, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['lyricist', { lyricist, brand }],
    queryFn: () => getLyricist(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useLyricist;

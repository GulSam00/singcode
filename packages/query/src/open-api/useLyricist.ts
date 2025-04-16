import { useQuery } from '@tanstack/react-query';
import { getLyricist, Brand } from '@repo/open-api';
import { OpenAPIResponse } from '../types';

interface GetLyricistProps {
  lyricist: string;
  brand?: Brand;
}

const useLyricist = (props: GetLyricistProps): OpenAPIResponse => {
  const { lyricist, brand } = props;

  // queryKey를 위한 brandKey 생성 (없으면 'all' 사용)
  const brandKey = brand || 'all';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['open', 'lyricist', lyricist, brandKey],
    queryFn: () => getLyricist({ lyricist, brand }),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useLyricist;

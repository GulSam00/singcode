import { useQuery } from '@tanstack/react-query';
import { getSong, Brand, ResponseType } from '@repo/open-api';
import { OpenAPIResponse } from '../types';

interface GetSongProps {
  title: string;
  brand?: Brand;
}

const useSong = (props: GetSongProps): OpenAPIResponse => {
  const { title, brand } = props;

  // queryKey를 위한 brandKey 생성 (없으면 'all' 사용)
  const brandKey = brand || 'all';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['open', 'song', title, brandKey],
    queryFn: () => getSong({ title, brand }),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useSong;

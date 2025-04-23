import { useQuery } from '@tanstack/react-query';
import { getComposer, Brand } from '@repo/open-api';
import { OpenAPIResponse } from '../types';

interface GetComposerProps {
  composer: string;
  brand?: Brand;
}

const useComposer = (props: GetComposerProps): OpenAPIResponse => {
  const { composer, brand } = props;

  // queryKey를 위한 brandKey 생성 (없으면 'all' 사용)
  const brandKey = brand || 'all';

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['open', 'composer', composer, brandKey],
    queryFn: () => getComposer({ composer, brand }),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useComposer;

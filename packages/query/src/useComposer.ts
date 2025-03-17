import { useQuery } from '@tanstack/react-query';
import { getComposer, Brand } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetComposerProps {
  composer: string;
  brand?: Brand;
}

const useComposer = (props: GetComposerProps): UseQueryReturn => {
  const { composer, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['composer', { composer, brand }],
    queryFn: () => getComposer(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useComposer;

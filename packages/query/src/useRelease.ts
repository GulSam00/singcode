import { useQuery } from '@tanstack/react-query';
import { getRelease, Brand } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetReleaseProps {
  release: string;
  brand?: Brand;
}

const useRelease = (props: GetReleaseProps): UseQueryReturn => {
  const { release, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['release', { release, brand }],
    queryFn: () => getRelease(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useRelease;

import { useQuery } from '@tanstack/react-query';
import { getNo, Brand } from '@repo/api';
import { UseQueryReturn } from './types';

interface GetNoProps {
  no: string;
  brand?: Brand;
}

const useNo = (props: GetNoProps): UseQueryReturn => {
  const { no, brand } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['no', { no, brand }],
    queryFn: () => getNo(props),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default useNo;

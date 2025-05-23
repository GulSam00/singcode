import { useQuery } from '@tanstack/react-query';
import { getPopular, Brand, Period } from '@repo/open-api';
import { OpenAPIResponse } from '../types';

interface GetPopularProps {
  brand: Brand;
  period: Period;
}

const usePopular = (props: GetPopularProps): OpenAPIResponse => {
  const { brand, period } = props;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['open', 'popular', brand, period],
    queryFn: () => getPopular({ brand, period }),
    enabled: Boolean(brand) && Boolean(period),
  });

  return {
    data,
    isLoading,
    isError,
    error,
  };
};

export default usePopular;

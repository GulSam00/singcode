'use client';

import StaticLoading from '@/components/StaticLoading';
import { useTjChartQuery } from '@/queries/tjChartQuery';
import { StrType } from '@/types/tjChart';
import { getPrevMonthFirstDayKST } from '@/utils/kst';

import ChartRankItem from './ChartRankItem';
import { PREVIEW_COUNT } from './PreviewSection';

export default function PopularPreview() {
  // 전체 보기(ChartRankingList)의 기본 조회와 같은 키라 캐시를 같이 쓴다.
  const { data, isPending } = useTjChartQuery(getPrevMonthFirstDayKST(), StrType.All);

  if (isPending) {
    return <StaticLoading />;
  }

  const items = data?.items ?? [];

  if (items.length === 0) {
    return <p className="text-muted-foreground py-8 text-center text-sm">데이터를 준비중이에요</p>;
  }

  return items.slice(0, PREVIEW_COUNT).map(item => <ChartRankItem key={item.id} item={item} />);
}

'use client';

import { Construction } from 'lucide-react';
import { useEffect, useState } from 'react';

import MarqueeText from '@/components/MarqueeText';
import StaticLoading from '@/components/StaticLoading';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTjChartQuery } from '@/queries/tjChartQuery';
import { STR_TYPE_LABEL, StrType } from '@/types/tjChart';
import { cn } from '@/utils/cn';

const getRankStyle = (rank: number) => {
  switch (rank) {
    case 1:
      return 'bg-amber-500 text-white font-bold';
    case 2:
      return 'bg-gray-300 text-white font-bold';
    case 3:
      return 'bg-amber-700 text-white font-bold';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const formatMonth = (month: string) => {
  const [year, m] = month.split('-');
  return `${year}년 ${Number(m)}월`;
};

export default function TjChartRankingList() {
  const [genre, setGenre] = useState<StrType>(StrType.All);
  const [month, setMonth] = useState<string | undefined>(undefined);

  const { data, isPending, isError } = useTjChartQuery(month, genre);

  useEffect(() => {
    if (data?.month && !month) {
      setMonth(data.month);
    }
  }, [data?.month, month]);

  if (isPending) {
    return <StaticLoading />;
  }

  const availableMonths = data?.availableMonths ?? [];
  const items = data?.items ?? [];

  return (
    <Card className="relative flex min-h-0 flex-1 flex-col">
      <CardHeader className="flex shrink-0 flex-col gap-3 pb-2">
        <CardTitle className="text-xl">TJ 인기차트</CardTitle>

        <div className="flex gap-2">
          <Select value={month} onValueChange={setMonth} disabled={availableMonths.length === 0}>
            <SelectTrigger className="w-[120px]" size="sm">
              <SelectValue placeholder="월 선택" />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map(m => (
                <SelectItem key={m} value={m}>
                  {formatMonth(m)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={genre} onValueChange={value => setGenre(value as StrType)}>
            <SelectTrigger className="w-[110px]" size="sm">
              <SelectValue placeholder="장르 선택" />
            </SelectTrigger>
            <SelectContent>
              {Object.values(StrType).map(type => (
                <SelectItem key={type} value={type}>
                  {STR_TYPE_LABEL[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <ScrollArea className="min-h-0 flex-1">
        <CardContent className="pt-0">
          <div className="space-y-0">
            {isError || items.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-4">
                <Construction className="text-muted-foreground h-16 w-16" />
                <p className="text-muted-foreground text-xl">데이터를 준비중이에요</p>
              </div>
            ) : (
              items.map(item => (
                <div key={item.id} className={cn('flex gap-4 border-b py-3 last:border-0')}>
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                      getRankStyle(item.rank),
                    )}
                  >
                    {item.rank}
                  </div>
                  <div className="flex w-full justify-between gap-2">
                    <div className="w-[140px] shrink-0">
                      <MarqueeText className="text-sm font-medium">{item.title}</MarqueeText>
                      {item.title_ko && item.title_ko !== item.title && (
                        <MarqueeText className="text-muted-foreground text-xs">
                          {item.title_ko}
                        </MarqueeText>
                      )}
                      <MarqueeText className="text-muted-foreground text-xs">
                        {item.artist}
                      </MarqueeText>
                      {item.artist_ko && item.artist_ko !== item.artist && (
                        <MarqueeText className="text-muted-foreground/70 text-xs">
                          {item.artist_ko}
                        </MarqueeText>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center">
                        <span className="text-brand-tj mr-1 w-8 text-xs">TJ</span>
                        <span className="text-sm font-medium">{item.num_tj}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-brand-ky mr-1 w-8 text-xs">금영</span>
                        <span className="text-sm font-medium">{item.num_ky}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

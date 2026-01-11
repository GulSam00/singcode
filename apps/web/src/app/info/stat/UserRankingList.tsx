import RankingItem from '@/components/RankingItem';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserSongStat } from '@/types/userStat';
import { cn } from '@/utils/cn';

interface RankingListProps {
  title: string;
  items: UserSongStat[];

  className?: string;
}
export default function UserRankingList({ title, items }: RankingListProps) {
  return (
    // <Card className={cn('max-w-md w-full', className)}>
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-0">
          {items.map((item, index) => (
            <RankingItem key={index} {...item} rank={index + 1} value={item.singCount} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

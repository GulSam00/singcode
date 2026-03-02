import MarqueeText from '@/components/MarqueeText';
import { Separator } from '@/components/ui/separator';
import { Song } from '@/types/song';

export default function RecentSongCard({ song }: { song: Song }) {
  const { title, artist, num_tj, num_ky } = song;

  return (
    <div className="w-full gap-4">
      {/* 노래 정보 */}
      <div className="flex flex-col">
        {/* 제목 및 가수 */}
        <div className="flex justify-between">
          <div className="max-w-[250px] min-w-[100px]">
            <MarqueeText className="text-base font-medium">{title}</MarqueeText>
            <MarqueeText className="text-muted-foreground text-sm">{artist}</MarqueeText>
          </div>

          <div className="flex flex-col space-x-4">
            <div className="flex items-center">
              <span className="text-brand-tj mr-1 w-8 text-xs">TJ</span>
              <span className="text-sm font-medium">{num_tj}</span>
            </div>
            <div className="flex items-center">
              <span className="text-brand-ky mr-1 w-8 text-xs">금영</span>
              <span className="text-sm font-medium">{num_ky}</span>
            </div>
          </div>
        </div>

        <Separator className="my-4" />
      </div>
    </div>
  );
}

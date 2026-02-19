'use client';

import { UserRoundSearch } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { krToJpnArtistSort } from '@/constants/krToJpnArtist';

interface JpnArtistListProps {
  onSelectArtist: (keyword: string) => void;
  callback: () => void;
}

export default function JpnArtistList({ onSelectArtist, callback }: JpnArtistListProps) {
  const [open, setOpen] = useState(false);

  const handleSelect = (keyword: string) => {
    onSelectArtist(keyword);
    callback();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <UserRoundSearch className="h-4 w-4" />
          일본 가수 찾기
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>일본 가수 리스트</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="flex flex-col gap-2">
            {Object.entries(krToJpnArtistSort).map(([kr, jpn]) => (
              <div
                key={kr}
                onClick={() => handleSelect(jpn)}
                className="hover:bg-accent/10 hover:text-accent flex cursor-pointer flex-col items-start gap-0.5 border-b py-3"
              >
                <span className="text-xl font-semibold underline underline-offset-4">{kr}</span>
                <span className="text-muted-foreground text-md">{jpn}</span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

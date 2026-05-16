'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

import changelog from '../../../public/changelog.json';

type ChangelogEntry = { title: string; date?: string; message: string[] };

const entries = Object.entries(changelog as Record<string, ChangelogEntry>).reverse();

export default function PatchNotesPage() {
  const router = useRouter();

  return (
    <div className="bg-background flex h-full flex-col">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">패치노트</h1>
      </div>

      <ScrollArea className="mt-4 flex-1">
        <ol className="relative flex flex-col gap-6 pb-8">
          <span
            aria-hidden
            className="bg-border absolute top-3 bottom-3 left-[5rem] w-px sm:left-[6rem]"
          />

          {entries.map(([version, entry]) => (
            <li
              key={version}
              className="grid grid-cols-[4rem_2rem_1fr] items-start sm:grid-cols-[5rem_2rem_1fr]"
            >
              <div className="text-muted-foreground text-right text-xs leading-5">
                {entry.date ?? ''}
              </div>

              <div className="relative h-5">
                <span
                  aria-hidden
                  className="border-border absolute top-1/2 right-0 left-0 -translate-y-1/2 border-t border-dashed"
                />
                <span
                  aria-hidden
                  className="bg-primary absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full"
                />
              </div>

              <div className="flex flex-col gap-1 pl-2">
                <div className="text-base leading-5 font-semibold">버전 {version}</div>
                <ul className="flex flex-col gap-1">
                  {entry.message.map((line, idx) => {
                    const isSub = line.startsWith('-');
                    return (
                      <li
                        key={idx}
                        className={
                          isSub ? 'text-muted-foreground pl-4 text-sm' : 'text-sm font-medium'
                        }
                      >
                        {isSub ? line : `• ${line}`}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </ScrollArea>
    </div>
  );
}

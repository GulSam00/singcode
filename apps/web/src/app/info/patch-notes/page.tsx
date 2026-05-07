'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import changelog from '../../../../public/changelog.json';

type ChangelogEntry = { title: string; message: string[] };

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
        <div className="flex flex-col gap-4 pb-8">
          {entries.map(([version, entry]) => (
            <Card key={version}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{entry.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="flex flex-col gap-1">
                  {entry.message.map((line, idx) => {
                    const isSub = line.startsWith('-');
                    return (
                      <li
                        key={idx}
                        className={
                          isSub
                            ? 'text-muted-foreground pl-4 text-sm'
                            : 'text-sm font-medium'
                        }
                      >
                        {isSub ? line : `• ${line}`}
                      </li>
                    );
                  })}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

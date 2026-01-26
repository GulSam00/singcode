'use client';

import { CalendarCheck, MessageCircleQuestion } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useUserQuery } from '@/queries/userQuery';

import Sidebar from './Sidebar';
import CheckInModal from './components/CheckInModal';

export default function Header() {
  const [open, setOpen] = useState(false);

  const router = useRouter();

  const { data: user, isLoading, error } = useUserQuery();

  const lastCheckIn = user?.last_check_in ?? new Date();

  const handleClickContact = () => {
    const contactUrl = 'https://walla.my/survey/K79c5bC6alDqc1qiaaES';
    window.open(contactUrl, '_blank');
  };

  const handleNavigateLogin = () => {
    router.push('/login');
    setOpen(false);
  };

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full max-w-md items-center justify-between p-4 shadow-sm">
      <div
        className="font-barcode hover:text-accent cursor-pointer text-5xl transition-colors"
        onClick={() => router.push('/')}
      >
        SINGCODE
      </div>
      <div className="flex items-center gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="justify-start" disabled={isLoading}>
              <CalendarCheck className="h-4 w-4" />
              출석체크
            </Button>
          </DialogTrigger>

          <DialogContent>
            <CheckInModal
              lastCheckIn={lastCheckIn}
              isLogin={!!user}
              handleNavigateLogin={handleNavigateLogin}
            />
          </DialogContent>
        </Dialog>

        <Button variant="outline" className="justify-start" onClick={() => handleClickContact()}>
          <MessageCircleQuestion className="h-4 w-4" />
          문의
        </Button>

        <Sidebar />
      </div>
    </header>
  );
}

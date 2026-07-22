'use client';

import { format } from 'date-fns';
import { CalendarCheck, MessageCircleQuestion, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useUserQuery } from '@/queries/userQuery';

import Sidebar from './Sidebar';
import CheckInModal from './components/CheckInModal';

type ExpandedButton = 'theme' | 'checkin' | 'contact' | null;

interface ExpandableButtonProps {
  buttonKey: ExpandedButton;
  expanded: ExpandedButton;
  label: string;
  icon: ReactNode;
  disabled?: boolean;
  onClick: () => void;
}

function ExpandableButton({
  buttonKey,
  expanded,
  label,
  icon,
  disabled,
  onClick,
}: ExpandableButtonProps) {
  const isExpanded = expanded === buttonKey;

  return (
    <Button
      variant="outline"
      size={isExpanded ? 'default' : 'icon'}
      className="dark:hover:bg-primary dark:hover:text-primary-foreground transition-all"
      disabled={disabled}
      onClick={onClick}
    >
      {icon}
      {isExpanded && label}
    </Button>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedButton>(null);
  const { theme, setTheme } = useTheme();
  const headerRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const { data: user, isLoading } = useUserQuery();

  const lastCheckIn = user?.last_check_in ?? new Date();
  const today = format(new Date(), 'yyyy-MM-dd');
  const isCheckedIn = format(new Date(lastCheckIn), 'yyyy-MM-dd') >= today;

  const handleClickContact = () => {
    const contactUrl = 'https://walla.my/survey/K79c5bC6alDqc1qiaaES';
    window.open(contactUrl, '_blank');
  };

  const handleNavigateLogin = () => {
    router.push('/login');
    setOpen(false);
  };

  const handleExpandableClick = (key: ExpandedButton, action: () => void) => {
    if (expanded === key) {
      action();
      setExpanded(null);
    } else {
      setExpanded(key);
    }
  };

  useEffect(() => {
    if (!isLoading && !!user && !isCheckedIn) {
      setOpen(true);
    }
  }, [isLoading, user, isCheckedIn]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setExpanded(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-background sticky top-0 z-50 flex h-16 w-full max-w-md shrink-0 items-center justify-between border-b p-4">
      <div
        className="font-barcode hover:text-accent cursor-pointer text-5xl transition-colors"
        onClick={() => router.push('/')}
      >
        SINGCODE
      </div>
      <div ref={headerRef} className="flex items-center gap-2">
        <ExpandableButton
          buttonKey="theme"
          expanded={expanded}
          label={theme === 'dark' ? '라이트 모드' : '다크 모드'}
          icon={
            <span className="relative h-4 w-4">
              <Sun className="absolute h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            </span>
          }
          onClick={() =>
            handleExpandableClick('theme', () => setTheme(theme === 'dark' ? 'light' : 'dark'))
          }
        />

        <ExpandableButton
          buttonKey="checkin"
          expanded={expanded}
          label="출석체크"
          icon={<CalendarCheck className="h-4 w-4" />}
          disabled={isLoading}
          onClick={() => handleExpandableClick('checkin', () => setOpen(true))}
        />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <CheckInModal
              lastCheckIn={lastCheckIn}
              isCheckedIn={isCheckedIn}
              isLogin={!!user}
              handleNavigateLogin={handleNavigateLogin}
            />
          </DialogContent>
        </Dialog>

        <ExpandableButton
          buttonKey="contact"
          expanded={expanded}
          label="문의"
          icon={<MessageCircleQuestion className="h-4 w-4" />}
          onClick={() => handleExpandableClick('contact', handleClickContact)}
        />

        <Sidebar />
      </div>
    </header>
  );
}

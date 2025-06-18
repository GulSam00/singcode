'use client';

import { LogOut, Menu, Pencil, User } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import DisquietBadge from '@/components/DisquietBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import useVersionDialog from '@/hooks/useVersionDialog';
import useAuthStore from '@/stores/useAuthStore';

export default function Sidebar() {
  // 목업 인증 상태
  const { user, isAuthenticated, logout, changeNickname } = useAuthStore();

  const [isOpenSidebar, setIsOpenSidebar] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || '');

  const { version } = useVersionDialog();

  const router = useRouter();

  const handleEditStart = () => {
    setIsEditing(true);
    setNewNickname(user?.nickname || '');
  };

  // 닉네임 수정 취소
  const handleEditCancel = () => {
    setIsEditing(false);
    setNewNickname(user?.nickname || '');
  };

  const handleEditSave = async () => {
    const result = await changeNickname(newNickname);
    if (result) setIsEditing(false);
  };

  const handleOpenGithub = () => {
    window.open('https://github.com/GulSam00/sing-code', '_blank');
  };

  const handleOpenTerm = () => {
    window.open(
      'https://coding-sham.notion.site/Singcode-215286f3bd70802c8191d2a0344ecc1c',
      '_blank',
    );
  };

  const handleLogin = () => {
    router.push('/login');
    setIsOpenSidebar(false);
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result) {
      window.location.reload();
    }
  };

  const handleWithdrawal = () => {
    router.push('/withdrawal');
    setIsOpenSidebar(false);
  };

  return (
    <Sheet open={isOpenSidebar} onOpenChange={setIsOpenSidebar}>
      <SheetTrigger asChild>
        <Button className="flex items-center justify-center">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="fixed right-1/2 w-[360px] translate-x-1/2 p-4">
        <SheetHeader>
          <SheetTitle>메뉴</SheetTitle>
        </SheetHeader>
        <div className="space-y-6">
          <div className="flex flex-col items-center space-y-2">
            <div className="bg-primary text-primary-foreground flex h-24 w-24 items-center justify-center rounded-full text-xl font-bold">
              {user?.nickname.slice(0, 4)}
            </div>
            <div className="w-full text-center">
              <div className="relative flex w-full items-center justify-center gap-2 font-medium">
                {isEditing ? (
                  // 수정 모드
                  <>
                    <Input
                      value={newNickname}
                      onChange={e => setNewNickname(e.target.value)}
                      className="h-8 w-32 text-center"
                      maxLength={10}
                    />
                    <div className="absolute right-0 flex items-center gap-1">
                      <Button size="icon" onClick={handleEditSave}>
                        저장
                      </Button>
                      <Button size="icon" variant="ghost" onClick={handleEditCancel}>
                        취소
                      </Button>
                    </div>
                  </>
                ) : (
                  // 표시 모드
                  <>
                    <span>{user ? user.nickname : '손님'}</span>
                    {user && (
                      <div className="absolute right-0">
                        <Button variant="ghost" size="sm" className="" onClick={handleEditStart}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2"></div>
        </div>

        <SheetFooter>
          <DisquietBadge />

          {isAuthenticated ? (
            <>
              <Button variant="outline" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                로그아웃
              </Button>
              <Button variant="destructive" className="mt-2 w-full" onClick={handleWithdrawal}>
                회원 탈퇴
              </Button>
            </>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleLogin}>
              <User className="mr-2 h-4 w-4" />
              로그인
            </Button>
          )}

          <div className="text-muted-foreground flex flex-col items-center gap-2 border-t pt-2">
            <div className="flex w-full flex-col items-center gap-2">
              <span className="text-xs">© 2025 singcode - Released under the MIT License.</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleOpenGithub}>
                <Image src="/github_mark.svg" alt="github" width={32} height={32} />
              </Button>
              <div>버전 {version}</div>
              <Button
                variant="link"
                className="text-muted-foreground h-auto p-0 text-xs"
                onClick={handleOpenTerm}
              >
                이용약관
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

'use client';

import { LogOut, Mail, Menu, Pencil, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useAuthStore } from '@/lib/store/useAuthStore';

import { Input } from './components/ui/input';

const SideBar = () => {
  // 목업 인증 상태
  const { user, isAuthenticated, logout, changeNickname } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newNickname, setNewNickname] = useState(user?.nickname || '');

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
    if (newNickname.length < 2) {
      toast.error('닉네임 수정 실패', {
        description: '닉네임은 2자 이상이어야 합니다.',
      });
      return;
    }

    if (newNickname === user?.nickname) {
      toast.error('닉네임 수정 실패', {
        description: '이전과 동일한 닉네임입니다다.',
      });
      return;
    }

    const result = await changeNickname(newNickname);
    console.log('result', result);
  };

  const handleLogin = () => {
    console.log('login');
    console.log('isAuthenticated', isAuthenticated);
    router.push('/login');
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  const handleClickContact = () => {
    const contactUrl = 'https://walla.my/survey/K79c5bC6alDqc1qiaaES';
    window.open(contactUrl, '_blank');
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
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
            <div className="bg-primary text-primary-foreground flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold">
              ?
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

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleClickContact()}
            >
              <Mail className="h-4 w-4" />
              개발자에게 문의
            </Button>
          </div>
        </div>
        <SheetFooter>
          {isAuthenticated ? (
            <Button variant="destructive" className="w-full" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              로그아웃
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={handleLogin}>
              <User className="mr-2 h-4 w-4" />
              로그인
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

export default SideBar;

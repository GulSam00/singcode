'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function WithdrawalPage() {
  const [confirmText, setConfirmText] = useState('');
  const router = useRouter();

  const handleWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 실제 탈퇴 처리 로직 구현
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="bg-background flex h-dvh flex-col justify-center px-4">
      <div className="mx-auto w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">회원 탈퇴</h1>
          <p className="text-muted-foreground text-sm">
            탈퇴 시 모든 데이터가 삭제되며 복구가 불가능해요.
            <br />
            정말로 탈퇴하시겠어요?
          </p>
        </div>
        <form onSubmit={handleWithdrawal} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmText">[회원탈퇴]라고 입력해주세요</Label>
            <Input
              id="confirmText"
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              required
              placeholder="회원탈퇴"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="destructive"
            className="w-full"
            disabled={confirmText !== '회원탈퇴'}
          >
            정말 탈퇴하기
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleCancel}>
            취소
          </Button>
        </form>
      </div>
    </div>
  );
}

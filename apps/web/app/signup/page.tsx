'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuthStore } from '@/stores/useAuthStore';
import { useModalStore } from '@/stores/useModalStore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { register, isLoading } = useAuthStore();
  const { openMessage } = useModalStore();
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      openMessage({
        title: '일치하지 않는 비밀번호',
        message: '비밀번호가 일치하지 않습니다.',
        variant: 'error',
      });
      return;
    }

    const { isSuccess, errorTitle, errorMessage } = await register(email, password);

    if (isSuccess) {
      openMessage({
        title: '회원가입 성공',
        message: '입력한 이메일로 인증 메일을 보냈어요.',
        variant: 'success',
        onButtonClick: () => router.push('/login'),
      });
    } else {
      openMessage({
        title: errorTitle,
        message: errorMessage || '회원가입 실패',
        variant: 'error',
      });
    }
  };

  return (
    <div
      className="bg-background flex min-h-screen flex-col justify-center px-4"
      style={{ maxWidth: '360px', margin: '0 auto' }}
    >
      <div className="w-full space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">회원가입</h1>
          <p className="text-muted-foreground text-sm">계정을 만들어 서비스를 이용하세요</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">비밀번호</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">비밀번호 확인</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? '처리 중...' : '회원가입'}
          </Button>

          <div className="text-center">
            <Link href="/login" className="text-primary text-sm hover:underline">
              이미 계정이 있으신가요? 로그인
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

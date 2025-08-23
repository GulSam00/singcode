'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useAuthStore from '@/stores/useAuthStore';
import useModalStore from '@/stores/useModalStore';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { register, isLoading } = useAuthStore();
  const { openMessage } = useModalStore();
  const router = useRouter();

  const handleOpenTerm = () => {
    window.open(
      'https://coding-sham.notion.site/Singcode-215286f3bd70802c8191d2a0344ecc1c',
      '_blank',
    );
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email.trim() === '' || password.trim() === '' || confirmPassword.trim() === '') {
      openMessage({
        title: '입력 오류',
        message: '이메일과 비밀번호를 입력하세요.',
        variant: 'error',
      });
      return;
    }

    if (!agreedToTerms) {
      openMessage({
        title: '이용약관 동의 필요',
        message: '이용약관에 동의해주세요.',
        variant: 'error',
      });
      return;
    }

    if (password !== confirmPassword) {
      openMessage({
        title: '일치하지 않는 비밀번호',
        message: '비밀번호가 일치하지 않습니다.',
        variant: 'error',
      });
      return;
    }

    const { isSuccess, title, message } = await register(email, password);

    if (isSuccess) {
      openMessage({
        title: title,
        message: message,
        variant: 'success',
        onButtonClick: () => router.push('/login'),
      });
    } else {
      openMessage({
        title: title,
        message: message || '회원가입 실패',
        variant: 'error',
      });
    }
  };

  return (
    <div className="bg-background flex h-dvh flex-col justify-center px-4">
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

          <div className="flex items-center space-x-2">
            <Checkbox
              id="terms"
              checked={agreedToTerms}
              onCheckedChange={checked => setAgreedToTerms(checked as boolean)}
            />
            <div className="flex items-center space-x-1 text-sm">
              <Label htmlFor="terms">
                <span>
                  <Button variant="link" className="h-auto p-0 text-sm" onClick={handleOpenTerm}>
                    이용약관
                  </Button>
                  에 동의합니다
                </span>
              </Label>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || !agreedToTerms}>
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

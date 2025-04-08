'use client';

import { AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/useAuthStore';
import { useModalStore } from '@/store/useModalStore';

export default function UpdatePasswordPage() {
  // 상태 관리
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState<'email' | 'reset'>('reset');

  const { isLoading, sendPasswordResetLink, changePassword } = useAuthStore();
  const { openMessage } = useModalStore();

  const router = useRouter();

  // 이메일 제출 처리 (비밀번호 재설정 링크 요청)
  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendPasswordResetLink(email);
  };

  // 비밀번호 재설정 처리
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 비밀번호 일치 여부 확인
    if (password !== confirmPassword) {
      toast.error('비밀번호 불일치', {
        description: '비밀번호를 다시 확인해주세요.',
      });
      return;
    }

    const result = await changePassword(password);

    if (result) {
      openMessage({
        title: '비밀번호 변경 성공',
        message: '비밀번호가 성공적으로 변경되었어요.',
        variant: 'success',
        onButtonClick: () => router.push('/login'),
      });
    }
  };

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == 'PASSWORD_RECOVERY') {
        setStep('reset'); // 비밀번호 재설정 단계로 이동
      }
    });
  }, []);

  return (
    <div className="bg-background flex h-full flex-col justify-center px-4">
      <div className="w-full space-y-6">
        {step === 'email' ? (
          // 이메일 입력 단계
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">비밀번호 찾기</h1>
              <p className="text-muted-foreground text-sm">
                가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.
              </p>
            </div>

            <form onSubmit={handleSendResetLink} className="space-y-4">
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

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '처리 중...' : '재설정 링크 받기'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-primary flex items-center justify-center text-sm hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </form>
          </>
        ) : (
          // 비밀번호 재설정 단계
          <>
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">비밀번호 재설정</h1>
              <p className="text-muted-foreground text-sm">새로운 비밀번호를 입력해주세요</p>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">새 비밀번호</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">비밀번호 확인</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={
                      confirmPassword &&
                      (password === confirmPassword ? 'border-green-500' : 'border-red-500')
                    }
                  />
                  <button
                    type="button"
                    className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2 transform"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                {/* 비밀번호 일치 여부 */}
                {confirmPassword && (
                  <div className="mt-1 flex items-center text-xs">
                    {password === confirmPassword ? (
                      <>
                        <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500">비밀번호가 일치합니다</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="mr-1 h-3 w-3 text-red-500" />
                        <span className="text-red-500">비밀번호가 일치하지 않습니다</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '처리 중...' : '비밀번호 변경'}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-primary flex items-center justify-center text-sm hover:underline"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  로그인 페이지로 돌아가기
                </Link>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { AlertCircle, CheckCircle2, Eye, EyeOff, Link } from 'lucide-react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import createClient from '@/lib/supabase/client';
import useAuthStore from '@/stores/useAuthStore';
import useModalStore from '@/stores/useModalStore';

export default function ResetPasswordSuccessPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { isLoading, changePassword } = useAuthStore();
  const { openMessage } = useModalStore();

  const router = useRouter();
  const supabase = createClient();

  const searchParams = useSearchParams();

  const token = searchParams.get('token');
  const email = searchParams.get('email');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token || !email) {
        alert('유효하지 않은 접근입니다');
        // router.push('/');
        return;
      }

      try {
        // 토큰을 이용한 세션 생성
        const { error } = await supabase.auth.verifyOtp({
          email,
          token,
          type: 'email',
        });

        if (error) throw error;
      } catch (error) {
        console.error('인증 오류:', error);
        alert('유효하지 않은 토큰입니다');
        // router.push('/');
      }
    };

    verifyToken();
  }, [token, email, router]);

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

  return (
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
  );
}

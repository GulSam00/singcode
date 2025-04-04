import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';

import { createClient } from '@/lib/supabase/client';

import { getErrorMessage } from '../utils';

export const supabase = createClient();

// 사용자 타입 정의
export interface User {
  id: string;
  nickname: string;
  profile_image: string | null;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 액션
  register: (email: string, password: string) => Promise<ResponseState>; // 반환 타입 변경
  login: (email: string, password: string) => Promise<ResponseState>; // 반환 타입 변경
  authKaKaoLogin: () => Promise<boolean>;

  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  insertUser: (id: string) => Promise<void>;
}

interface ResponseState {
  isSuccess: boolean;
  errorTitle?: string;
  errorMessage?: string;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,

  register: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user?.identities?.length === 0) {
        return {
          isSuccess: false,
          errorTitle: '이메일 중복',
          errorMessage: '이미 가입된 이메일입니다.',
        };
      }

      toast.success('회원가입 성공', {
        description: '만나서 반가워요!',
      });

      return {
        isSuccess: true,
      };
    } catch (error) {
      if (error instanceof AuthError) {
        return getErrorMessage(error.code as string);
      } else {
        return {
          isSuccess: false,
          errorTitle: '회원가입 실패',
          errorMessage: '회원 가입이 실패했어요.',
        };
      }
    } finally {
      set({ isLoading: false });
    }
  },
  // 로그인 액션
  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast.success('로그인 성공', {
        description: '다시 만나서 반가워요!',
      });

      return {
        isSuccess: true,
      }; // 성공 시 true 반환
    } catch (error) {
      const { code } = error as AuthError;
      return getErrorMessage(code as string);
    } finally {
      set({ isLoading: false });
    }
  },
  authKaKaoLogin: async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
      });
      if (error) throw error;

      toast.success('카카오 로그인 성공', {
        description: '다시 만나서 반가워요!',
      });
      return true;
    } catch (error) {
      console.error('카카오 로그인 오류:', error);
      toast.error('카카오 로그인 실패', {
        description: '카카오 로그인에 문제가 있어요...',
      });

      return false;
    }
  },
  // 로그아웃 액션
  logout: async () => {
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  // 인증 상태 확인
  checkAuth: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) throw error;
      if (!get().user) {
        const id = data.user.id;
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();
        console.log('existingUser : ', existingUser);
        if (!existingUser) get().insertUser(id);
        else {
          set({ user: existingUser, isAuthenticated: true });
        }
      }
      return true;
    } catch (error) {
      console.error('checkAuth 오류:', error);
      return false;
    }
  },
  insertUser: async (id: string) => {
    try {
      const { data: user, error } = await supabase.from('users').insert({ id }).select().single();
      if (error) throw error;
      set({ user: user, isAuthenticated: true });
    } catch (error) {
      console.error('insertUser 오류:', error);
    }
  },
}));

import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import createClient from '@/lib/supabase/client';
import { User } from '@/types/user';
import { getSupabaseErrorMessage } from '@/utils/getErrorMessage';

import { withLoading } from './middleware';

const supabase = createClient();

// 사용자 타입 정의

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 액션
  register: (email: string, password: string) => Promise<ModalResponseState>; // 반환 타입 변경
  login: (email: string, password: string) => Promise<ModalResponseState>; // 반환 타입 변경
  authKaKaoLogin: () => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
  insertUser: (id: string) => Promise<void>;

  changeNickname: (nickname: string) => Promise<boolean>;
  sendPasswordResetLink: (email: string) => Promise<void>;
  changePassword: (password: string) => Promise<ModalResponseState>;
}

// useModalStore에서 사용할 데이터를 전달해줘야 할 때의 타입
// 기본적인 toast 제어는 store 단에서 처리할 계획
interface ModalResponseState {
  isSuccess: boolean;
  title: string;
  message: string;
}

const useAuthStore = create(
  immer<AuthState>((set, get) => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,

    register: async (email, password) => {
      return await withLoading(set, get, async () => {
        try {
          const { data, error } = await supabase.auth.signUp({ email, password });
          if (error) throw error;

          if (data.user?.identities?.length === 0) {
            return {
              isSuccess: false,
              title: '이메일 중복',
              message: '이미 가입된 이메일입니다.',
            };
          }

          return {
            isSuccess: true,
            title: '회원가입 성공',
            message: '입력한 이메일로 인증 메일을 보냈어요.',
          };
        } catch (error) {
          if (error instanceof AuthError) {
            return getSupabaseErrorMessage(error.code as string);
          }
          return {
            isSuccess: false,
            title: '회원가입 실패',
            message: '회원 가입이 실패했어요.',
          };
        }
      });
    },
    // 로그인 액션
    login: async (email, password) => {
      return await withLoading(set, get, async () => {
        try {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          toast.success('로그인 성공', { description: '다시 만나서 반가워요!' });
          return {
            isSuccess: true,
            title: '로그인 성공',
            message: '다시 만나서 반가워요!',
          };
        } catch (error) {
          const { code } = error as AuthError;
          return getSupabaseErrorMessage(code as string);
        }
      });
    },
    authKaKaoLogin: async () => {
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'kakao',
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}`,
          },
        });
        console.log(data);
        if (error) throw error;

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
      const { data, error } = await supabase.auth.getUser();
      if (error) return false;
      if (!get().user) {
        const id = data.user.id;
        const { data: existingUser } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single();

        if (!existingUser) get().insertUser(id);
        else {
          set(state => {
            state.user = existingUser;
            state.isAuthenticated = true;
          });
        }
      }
      return true;
    },
    insertUser: async (id: string) => {
      try {
        const { data: user, error } = await supabase.from('users').insert({ id }).select().single();
        if (error) throw error;
        set(state => {
          state.user = user;
          state.isAuthenticated = true;
        });
      } catch (error) {
        console.error('insertUser 오류:', error);
      }
    },
    changeNickname: async (nickname: string) => {
      return await withLoading(set, get, async () => {
        try {
          const { user } = get();
          if (!user) throw new Error('No user found in store');

          if (nickname.length < 2) {
            toast.error('닉네임 수정 실패', {
              description: '닉네임은 2자 이상이어야 해요.',
            });
            return false;
          }

          if (nickname === user.nickname) {
            toast.error('닉네임 수정 실패', {
              description: '이전과 동일한 닉네임이에요.',
            });
            return false;
          }

          const result = await supabase
            .from('users')
            .update({ nickname: nickname })
            .eq('id', user.id)
            .select()
            .single();
          set({ user: result.data, isAuthenticated: true });

          toast.success('닉네임 수정 성공', {
            description: '닉네임이 성공적으로 수정되었어요!',
          });
          return true;
        } catch (error) {
          toast.error('닉네임 수정 실패', {
            description: '닉네임 수정에 실패했어요.',
          });

          console.error('changeNickname 오류:', error);
          return false;
        }
      });
    },
    sendPasswordResetLink: async (email: string) => {
      return await withLoading(set, get, async () => {
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/update-password`,
          });
          if (error) {
            throw error;
          }
          toast.success('재설정 링크 발송 완료', {
            description: `${email}로 비밀번호 재설정 링크를 발송했어요. 이메일을 확인해주세요.`,
          });
        } catch (error) {
          console.error('비밀번호 재설정 링크 발송 실패:', error);
          toast.error('링크 발송 실패', {
            description: '비밀번호 재설정 링크 발송 중 오류가 발생했어요.',
          });
        }
      });
    },

    changePassword: async (password: string) => {
      return await withLoading(set, get, async () => {
        try {
          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;

          return {
            isSuccess: true,
            title: '비밀번호 변경 완료',
            message: '비밀번호가 성공적으로 변경되었어요.',
          };
        } catch (error) {
          // console.log(error);
          // console.log(Object.entries(error));
          const { code } = error as AuthError;
          return getSupabaseErrorMessage(code as string);
        }
      });
    },
  })),
);

export default useAuthStore;

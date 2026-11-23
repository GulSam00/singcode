import { AuthError } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

import { User } from '@/types/user';
import { getSupabaseErrorMessage } from '@/utils/getErrorMessage';
import { getSupabase } from '@/utils/getSupabase';

import { withLoading } from './middleware';

// 사용자 타입 정의

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // 액션
  register: (email: string, password: string) => Promise<ModalResponseState>; // 반환 타입 변경
  login: (email: string, password: string) => Promise<ModalResponseState>; // 반환 타입 변경
  authKaKaoLogin: () => Promise<boolean>;
  logout: () => Promise<boolean>;
  checkAuth: () => Promise<boolean>;
  insertUser: (id: string) => Promise<boolean>;

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

const initialState: Pick<AuthState, 'user' | 'isLoading' | 'isAuthenticated'> = {
  user: null,
  isLoading: false,
  isAuthenticated: false,
};

const useAuthStore = create(
  immer<AuthState>((set, get) => ({
    ...initialState,

    register: async (email, password) => {
      return await withLoading(set, get, async () => {
        try {
          const supabase = getSupabase();
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
          const supabase = getSupabase();

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
        const supabase = getSupabase();

        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'kakao',
          // options: {
          //   redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}`,
          // },
        });
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
      const supabase = getSupabase();

      const { error } = await supabase.auth.signOut();
      if (!error) {
        set(initialState);
        return true;
      }
      return false;
    },

    // 인증 상태 확인
    checkAuth: async () => {
      const supabase = getSupabase();

      const { data, error } = await supabase.auth.getUser();
      if (error) return false;
      if (!get().user) {
        const id = data.user.id;
        // maybeSingle: 행이 없으면 error 없이 null이다. 그래서 error는 "조회 자체가 실패"만 뜻한다.
        // 예전처럼 single()의 "행 없음" 오류와 네트워크 오류를 같이 null로 보면, 이미 가입한 사람에게
        // insert를 시도해 중복 키로 실패하고 로그인 상태가 반쯤 걸린 채 남는다.
        const { data: existingUser, error: selectError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .maybeSingle<User>();

        // 세션은 유효하므로 true를 유지한다(false면 auth.tsx가 로그인 화면으로 보낸다).
        // isAuthenticated는 false로 남아 회원 기능·자동 출석이 돌지 않고, 다음 라우트 이동 때 다시 시도한다.
        if (selectError) {
          console.error('users 조회 오류:', selectError);
          return true;
        }

        if (existingUser) {
          set(state => {
            state.user = existingUser;
            state.isAuthenticated = true;
          });
        } else {
          // 신규 가입. insertUser가 users 행을 만든 뒤에야 isAuthenticated를 켜므로,
          // 자동 출석(useAutoCheckIn)은 행이 생긴 다음에 daily_check_in을 부른다(user_not_found 없음).
          // await로 checkAuth가 끝나는 시점도 상태 반영 이후로 맞춘다.
          // 결과와 관계없이 세션은 유효하므로 true. 실패하면 isAuthenticated가 false로 남는다.
          await get().insertUser(id);
        }
      }
      return true;
    },
    insertUser: async (id: string) => {
      const supabase = getSupabase();

      const { data: user, error } = await supabase
        .from('users')
        .insert({ id })
        .select()
        .single<User>();

      if (!error) {
        set(state => {
          state.user = user;
          state.isAuthenticated = true;
        });
        return true;
      }

      // 23505(unique_violation): 다른 탭이나 카카오 리다이렉트 직후의 중복 checkAuth가 먼저 행을 만들었다.
      // 실패가 아니라 "이미 있음"이므로 다시 읽어서 이어간다.
      if (error.code === '23505') {
        const { data: existingUser, error: retryError } = await supabase
          .from('users')
          .select('*')
          .eq('id', id)
          .single<User>();

        if (!retryError) {
          set(state => {
            state.user = existingUser;
            state.isAuthenticated = true;
          });
          return true;
        }
        console.error('users 재조회 오류:', retryError);
        return false;
      }

      console.error('insertUser 오류:', error);
      return false;
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

          const supabase = getSupabase();
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
          const supabase = getSupabase();

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
          const supabase = getSupabase();

          const { error } = await supabase.auth.updateUser({ password });
          if (error) throw error;

          return {
            isSuccess: true,
            title: '비밀번호 변경 완료',
            message: '비밀번호가 성공적으로 변경되었어요.',
          };
        } catch (error) {
          const { code } = error as AuthError;
          return getSupabaseErrorMessage(code as string);
        }
      });
    },
  })),
);

export default useAuthStore;

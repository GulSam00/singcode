import { redirect } from 'next/navigation';

import { createClient } from '@/supabase/server';

import KakaoLoginButton from './KakaoLoginButton';
import { login, register } from './actions';

// 새로운 클라이언트 컴포넌트

export default async function LoginPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data) {
    console.log('data : ', data);
    // redirect('/');
  }

  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={register}>Sign up</button>
      <KakaoLoginButton />
    </form>
  );
}

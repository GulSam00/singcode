import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import { login, register } from './actions';
import KakaoLoginButton from './KakaoLoginButton'; // 새로운 클라이언트 컴포넌트

export default async function LoginPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();

  if (data) {
    console.log('data : ', data);
    // redirect('/');
  }

  // const kakao_client_id = process.env.KAKAO_REST_API_KEY;
  // const kakao_redirect_uri = process.env.KAKAO_REDIRECT_URI;

  // const kakao_url = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${kakao_client_id}&redirect_uri=${kakao_redirect_uri}`;

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

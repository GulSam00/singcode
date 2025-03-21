import { redirect } from 'next/navigation';
import { createClient } from '@/supabase/server';
import { login, register } from './actions';

export default async function LoginPage() {
  const supabase = await createClient();

  const { data } = await supabase.auth.getUser();
  // data 있으면 라우팅
  if (data) {
    console.log('data : ', data);
    redirect('/');
  }

  return (
    <form>
      <label htmlFor="email">Email:</label>
      <input id="email" name="email" type="email" required />
      <label htmlFor="password">Password:</label>
      <input id="password" name="password" type="password" required />
      <button formAction={login}>Log in</button>
      <button formAction={register}>Sign up</button>
    </form>
  );
}

'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const response = await supabase.auth.signInWithPassword(data)
  if (response.error) {
    throw new Error(
      JSON.stringify({
        code: response.error.status || 500,
        message: response.error.message,
      }),
    )
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function register(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const response = await supabase.auth.signUp(data)
  console.log('response : ', response)
  if (response.error) {
    // 에러를 클라이언트에 전달

    throw new Error(
      JSON.stringify({
        code: response.error.status || 500,
        message: response.error.message,
      }),
    )
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

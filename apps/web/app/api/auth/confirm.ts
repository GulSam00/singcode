import { type EmailOtpType } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next'

import createClient from '@/supabase/api'

function stringOrFirstString(item: string | string[] | undefined) {
  return Array.isArray(item) ? item[0] : item
}

// API Route에서는 throw 대신 적절한 HTTP 응답 필요. 리다이렉팅의 이유?

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).appendHeader('Allow', 'GET').end()
    return
  }

  const queryParams = req.query
  const token_hash = stringOrFirstString(queryParams.token_hash)
  const type = stringOrFirstString(queryParams.type)
  const nextUrl = stringOrFirstString(queryParams.next) || '/'

  try {
    if (!token_hash || !type) {
      return res.redirect('/error?message=missing-parameters')
    }

    const supabase = createClient(req, res)
    const { error } = await supabase.auth.verifyOtp({
      type: type as EmailOtpType,
      token_hash,
    })

    if (error) {
      console.error('인증 에러:', error)
      return res.redirect(`/error?message=${encodeURIComponent(error.message)}`)
    }

    // 성공 시 nextUrl로 리다이렉트
    return res.redirect(nextUrl)
  } catch (error) {
    console.error('예상치 못한 에러:', error)
    return res.redirect('/error?message=unexpected-error')
  }
}

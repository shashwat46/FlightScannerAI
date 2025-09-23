'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getSupabaseBrowserClient } from '@/src/lib/supabase/client'

export default function AuthBrowserCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    const code = searchParams.get('code')
    if (!code) {
      router.replace('/')
      return
    }
    ;(async () => {
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)
      if (error || !data?.session) {
        console.error('Exchange code error', error)
        router.replace('/')
        return
      }
      // Pass tokens to server to store cookies for SSR consistency
      await fetch('/api/auth/cookies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token
        })
      })
      router.replace('/')
    })()
  }, [router, searchParams])

  return null
}

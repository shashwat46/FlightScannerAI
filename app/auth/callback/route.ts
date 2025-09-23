import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = {
      get(name: string) {
        return request.cookies.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        // Will be set in the response
      },
      remove(name: string, options: CookieOptions) {
        // Will be set in the response
      }
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: cookieStore
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Successful authentication - redirect to home
      const response = NextResponse.redirect(`${origin}/`)
      
      // Set the cookies properly in the response
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        response.cookies.set({
          name: 'sb-access-token',
          value: session.access_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        })
        
        response.cookies.set({
          name: 'sb-refresh-token', 
          value: session.refresh_token,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/'
        })
      }
      
      return response
    }
  }

  // Fallback redirect to home page
  return NextResponse.redirect(`${origin}/`)
}

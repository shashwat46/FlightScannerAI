import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { PUBLIC_PAGES, PUBLIC_API, PROTECTED_PAGES, PROTECTED_API } from '@/src/constants/access'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers }
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({ request: { headers: request.headers } })
          response.cookies.set({ name, value: '', ...options })
        }
      }
    }
  )

  // refresh session if necessary
  await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublicPage = PUBLIC_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isPublicApi = PUBLIC_API.some(p => pathname === p || pathname.startsWith(p + '/'))
  const isProtectedPage = PROTECTED_PAGES.some(p => pathname.startsWith(p + '/'))
  const isProtectedApi = PROTECTED_API.some(p => pathname.startsWith(p))

  if (!session && (isProtectedPage || isProtectedApi)) {
    if (isProtectedApi) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const url = request.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}

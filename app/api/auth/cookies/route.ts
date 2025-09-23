import { NextResponse, NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { access_token, refresh_token } = await request.json()
  if (!access_token || !refresh_token) {
    return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
  }

  const response = NextResponse.json({ ok: true })
  const isProd = process.env.NODE_ENV === 'production'

  response.cookies.set({
    name: 'sb-access-token',
    value: access_token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/'
  })
  response.cookies.set({
    name: 'sb-refresh-token',
    value: refresh_token,
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/'
  })

  return response
}

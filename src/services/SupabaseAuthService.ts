import { getSupabaseServerClient } from '@/src/lib/supabase/server'
import type { AuthService } from '@/src/domain/auth/service'
import type { Session } from '@/src/domain/auth/types'

export class SupabaseAuthService implements AuthService {
  async getSession(): Promise<Session | null> {
    const {
      data: { user }
    } = await getSupabaseServerClient().auth.getUser()

    if (!user) return null

    return {
      userId: user.id,
      email: user.email
    }
  }

  async signOut(): Promise<void> {
    await getSupabaseServerClient().auth.signOut()
  }
}

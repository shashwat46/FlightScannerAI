import type { Session } from './types'

export interface AuthService {
  /**
   * Returns current session if authenticated, otherwise null.
   */
  getSession(): Promise<Session | null>

  /**
   * Logs the user out and clears local session state.
   */
  signOut(): Promise<void>
}

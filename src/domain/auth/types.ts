export type Session = {
  /** Unique user identifier, provider-agnostic */
  userId: string
  /** Verified email address, may be null if provider withheld */
  email: string | null
}

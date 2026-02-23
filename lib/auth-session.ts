// Stub: JWT auth handles all cases — getSession is a fallback for NextAuth OAuth (unused)
export type SessionWithUserId = { user?: { id: string; email?: string; name?: string; image?: string } } | null;

export async function getSession(): Promise<SessionWithUserId> {
  return null;
}

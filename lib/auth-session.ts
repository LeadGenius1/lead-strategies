// Export must match: { user?: { id: string; email?: string } } | null
// Uses getServerSession() without options - matches platform pattern (backend-token)
// Session callback adds id from JWT token.sub
import { getServerSession } from 'next-auth';

export type SessionWithUserId = { user?: { id: string; email?: string; name?: string; image?: string } } | null;

export async function getSession(): Promise<SessionWithUserId> {
  return getServerSession() as Promise<SessionWithUserId>;
}

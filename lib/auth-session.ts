import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export type SessionWithUserId = { user?: { id: string; email?: string; name?: string; image?: string } } | null;

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';

export async function getSession(): Promise<SessionWithUserId> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value || cookieStore.get('admin_token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as Record<string, unknown>;
    const id = (decoded.id || decoded.userId || decoded.sub) as string | undefined;
    if (!id) return null;

    return {
      user: {
        id,
        email: (decoded.email as string) || undefined,
        name: (decoded.name as string) || undefined,
      },
    };
  } catch {
    return null;
  }
}

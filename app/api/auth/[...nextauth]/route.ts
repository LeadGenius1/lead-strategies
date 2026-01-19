/**
 * NextAuth Configuration
 * OAuth (Google + Microsoft) with database sessions
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
import { PrismaAdapter } from '@next-auth/prisma-adapter';

// Import Prisma client from backend (shared database)
// Note: In production, this should use the same DATABASE_URL as backend
let prisma: any;
try {
  // Try to use Prisma from backend if available
  const { PrismaClient } = require('@prisma/client');
  prisma = new PrismaClient();
} catch (error) {
  // Fallback: Prisma will be initialized via adapter
  prisma = null;
}

export const authOptions: NextAuthOptions = {
  adapter: prisma ? PrismaAdapter(prisma) : undefined, // Will use database sessions if Prisma available
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || '',
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || '',
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async session({ session, user }) {
      // Add user ID and tier to session
      if (session.user && user) {
        (session.user as any).id = user.id;
        // Fetch user tier from database if Prisma available
        if (prisma) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: user.id },
              select: { tier: true, subscriptionStatus: true },
            });
            if (dbUser) {
              (session.user as any).tier = dbUser.tier;
              (session.user as any).subscriptionStatus = dbUser.subscriptionStatus;
            }
          } catch (error) {
            console.error('Error fetching user tier:', error);
          }
        }
      }
      return session;
    },
    async signIn({ user, account, profile }) {
      // Allow sign in
      return true;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

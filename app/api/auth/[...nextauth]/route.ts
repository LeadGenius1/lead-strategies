/**
 * NextAuth Configuration
 * OAuth (Google + Microsoft) with database sessions
 */

import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import AzureADProvider from 'next-auth/providers/azure-ad';
// Removed PrismaAdapter import - using JWT sessions instead

// Use JWT sessions instead of database sessions to avoid Prisma build issues
// Database sessions require Prisma schema in frontend, which causes build failures
// JWT sessions are stateless and work without database adapter
const authOptions: NextAuthOptions = {
  adapter: undefined, // Using JWT sessions (stateless) instead of database sessions
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
    strategy: 'jwt', // Changed from 'database' to 'jwt' to avoid Prisma dependency
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
    async session({ session, token }) {
      // Add user ID and tier to session from JWT token
      if (session.user && token) {
        (session.user as any).id = token.sub;
        (session.user as any).tier = token.tier;
        (session.user as any).subscriptionStatus = token.subscriptionStatus;
      }
      return session;
    },
    async jwt({ token, user, account }) {
      // Add user data to JWT token on sign in
      if (user) {
        token.id = user.id;
        token.tier = (user as any).tier;
        token.subscriptionStatus = (user as any).subscriptionStatus;
      }
      return token;
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

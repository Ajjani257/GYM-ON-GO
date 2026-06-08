import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        await dbConnect();
        const user = await User.findOne({ email: credentials.email });
        if (!user) throw new Error('No user found with this email');
        const valid = await bcrypt.compare(credentials.password, user.password);
        if (!valid) throw new Error('Invalid password');
        return { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      try {
        if (account.provider === 'google') {
          await dbConnect();
          const existing = await User.findOne({ email: user.email });
          if (!existing) {
            const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
            await User.create({
              name: user.name || 'Google User',
              email: user.email,
              password: randomPass,
              role: 'member',
            });
          }
        }
        return true;
      } catch (error) {
        console.error('SIGNIN ERROR:', error);
        return false;
      }
    },
    async jwt({ token, user, account }) {
      try {
        if (user) {
          if (account?.provider === 'google') {
            await dbConnect();
            const dbUser = await User.findOne({ email: user.email });
            if (dbUser) {
              token.id = dbUser._id.toString();
              token.role = dbUser.role || 'member';
            }
          } else {
            token.id = user.id;
            token.role = user.role || 'member';
          }
        } else if (!token.role && token.id) {
          await dbConnect();
          const dbUser = await User.findById(token.id);
          if (dbUser) {
            token.role = dbUser.role || 'member';
          }
        }
        return token;
      } catch (error) {
        console.error('JWT ERROR:', error);
        return token;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role || 'member';
      }
      return session;
    },
  },
  pages: { signIn: '/auth' },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

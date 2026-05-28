import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

const handler = NextAuth({
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
        return { id: user._id.toString(), name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === 'google') {
        await dbConnect();
        const existing = await User.findOne({ email: user.email });
        if (!existing) {
          const randomPass = await bcrypt.hash(Math.random().toString(36), 10);
          await User.create({
            name: user.name,
            email: user.email,
            password: randomPass,
          });
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        if (account?.provider === 'google') {
          await dbConnect();
          const dbUser = await User.findOne({ email: user.email });
          if (dbUser) token.id = dbUser._id.toString();
        } else {
          token.id = user.id;
        }
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id;
      return session;
    },
  },
  pages: { signIn: '/auth' },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };

import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/libs/prisma";
import bcrypt from "bcrypt";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findFirst({
          where: { username: credentials.username },
        });

        if (!user || !user.password) return null;

        const isPasswordMatched = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordMatched) return null;

        return {
          id: user.id,
          name: user.username,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  pages: {
    signIn: "/signin",
  },

  session: {
    strategy: "jwt",
  },

  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        if (account.provider === "google" || account.provider === "github") {
          const dbUser = await prisma.user.upsert({
            where: { email: user.email },
            update: {
              username: user.name,
              image: user.image,
            },
            create: {
              email: user.email,
              username: user.name,
              image: user.image,
            },
          });
          token.id = dbUser.id;
        } else {
          token.id = user.id;
        }
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
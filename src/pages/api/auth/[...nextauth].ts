import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CognitoProvider from "next-auth/providers/cognito";
import { prisma } from "../../../server/db/client";
import { serverEnv } from "../../../utils/env/server";

export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.isOnboarded = user.isOnboarded;
      }
      return session;
    },
  },
  secret: serverEnv.NEXTAUTH_SECRET,
  debug: true,
  logger: {
    error(code, metadata) {
      console.error(code, metadata);
    },
    warn(code) {
      console.warn(code);
    },
    debug(code, metadata) {
      console.debug(code, metadata);
    },
  },
  adapter: PrismaAdapter(prisma),
  providers: [
    CognitoProvider({
      clientId: serverEnv.COGNITO_CLIENT_ID,
      clientSecret: serverEnv.COGNITO_CLIENT_SECRET,
      issuer: serverEnv.COGNITO_ISSUER,
    }),
  ],
};

export default NextAuth(authOptions);

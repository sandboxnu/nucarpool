import NextAuth from "next-auth";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { prisma } from "../../../server/db/client";
import { serverEnv } from "../../../utils/env/server";
import AzureADProvider from "next-auth/providers/azure-ad";
import GoogleProvider from "next-auth/providers/google";

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
    GoogleProvider({
      clientId: serverEnv.GOOGLE_CLIENT_ID,
      clientSecret: serverEnv.GOOGLE_CLIENT_SECRET,
    }),
    // AzureADProvider({
    //   clientId: serverEnv.AZURE_CLIENT_ID,
    //   clientSecret: serverEnv.AZURE_CLIENT_SECRET,
    //   tenantId: serverEnv.AZURE_TENANT_ID,
    // }),
  ],
};

export default NextAuth(authOptions);

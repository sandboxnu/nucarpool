import { DefaultSession } from "next-auth";
import { Permission } from "@prisma/client";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user?: {
      id?: string;
      isOnboarded: boolean;
      permission: Permission;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    isOnboarded: boolean;
    permission: Permission;
  }
}

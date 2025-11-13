import * as trpc from "@trpc/server";
import * as trpcNext from "@trpc/server/adapters/next";
import { getServerSession } from "next-auth";

import { authOptions as nextAuthOptions } from "../../pages/api/auth/[...nextauth]";
import { prisma } from "../db/client";
import { SESClient } from "@aws-sdk/client-ses";
import { fromEnv } from "@aws-sdk/credential-provider-env";
import { serverEnv } from "../../utils/env/server";

export const createContext = async (
  opts?: trpcNext.CreateNextContextOptions,
) => {
  const req = opts?.req;
  const res = opts?.res;

  const sesClient = new SESClient({
    region: serverEnv.AWS_REGION,
    credentials: {
      accessKeyId: serverEnv.AWS_ACCESS_KEY_ID,
      secretAccessKey: serverEnv.AWS_SECRET_ACCESS_KEY,
    },
  });

  const session =
    req && res && (await getServerSession(req, res, nextAuthOptions));

  return {
    req,
    res,
    session,
    prisma,
    sesClient,
  };
};

export type Context = trpc.inferAsyncReturnType<typeof createContext>;
